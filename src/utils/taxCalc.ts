export type CompanyType = 'MEI' | 'ME' | 'EPP' | 'OUT'

// MEI ceiling (kept at 81,000 to match current active legislation)
export const MEI_CEILING = 81_000
export const ME_CEILING  = 360_000
export const EPP_CEILING = 4_800_000

export type TaxRegime = 'anexo3' | 'anexo5' | 'custom'

export interface CalcParams {
  jobs: { amount: number, currency: 'USD' | 'BRL' }[]
  exchangeRate: number
  remittanceFeePercent: number   // e.g. 1.5 = 1.5%
  dasTaxPercent: number          // used if taxRegime is 'custom'
  taxRegime?: TaxRegime          // defaults to 'custom' if undefined for backward compat
  accountingFee: number          // fixed BRL amount
}

export interface DeductionResult {
  grossBrl: number
  annualGrossBrl: number
  companyType: CompanyType
  remittanceCost: number
  dasCost: number
  accountingFee: number
  proLabore: number
  inssCost: number
  irrfCost: number
  totalDeductions: number
  netIncomeBrl: number
  effectiveTaxRate: number
}

/**
 * Calcula o salário Bruto mensal CLT (anunciado na vaga) equivalente ao Líquido PJ.
 * Precedentes realistas:
 * - PJ fatura apenas 11 meses no ano (1 mês de férias/descanso não remunerado).
 * - CLT recebe 13,33 salários no ano (12 meses + 13º + 1/3 de férias).
 * - CLT possui FGTS de 8% (renda indireta) sobre os 13,33 salários.
 * - CLT possui benefícios (VR/VA/Plano de Saúde) na faixa de R$ 1.000/mês.
 * - Desconto médio de INSS/IRRF na CLT em salários mais altos é de aprox 25% (Líquido = 75% do Bruto).
 */
export function calcEquivalentCLT(netIncomeMonthlyBrl: number): number {
  const annualNetPJ = netIncomeMonthlyBrl * 11 // PJ só ganha se trabalhar, assume 1 mês off
  const annualBenefits = 1000 * 12 // VR/VA
  
  // Coeficiente CLT: 
  // 13.33 * 0.75 (Líquido na conta) = 10 salários líquidos
  // 13.33 * 0.08 (FGTS) = 1.06 salários
  // Total do coeficiente: 11.06
  const equivalentGross = (annualNetPJ - annualBenefits) / 11.06
  
  return equivalentGross > 0 ? equivalentGross : 0
}

export function getCompanyType(annualGrossBrl: number): CompanyType {
  if (annualGrossBrl <= MEI_CEILING)  return 'MEI'
  if (annualGrossBrl <= ME_CEILING)   return 'ME'
  if (annualGrossBrl <= EPP_CEILING)  return 'EPP'
  return 'OUT'
}

/**
 * Calcula a alíquota efetiva do Simples Nacional com base no faturamento anualizado
 */
export function calcSimplesNacionalRate(annualGrossBrl: number, regime: TaxRegime): number {
  if (regime === 'custom') return 0;
  
  let nominalRate = 0;
  let deduction = 0;

  if (regime === 'anexo3') {
    if      (annualGrossBrl <= 180_000)   { nominalRate = 0.060; deduction = 0; }
    else if (annualGrossBrl <= 360_000)   { nominalRate = 0.112; deduction = 9360; }
    else if (annualGrossBrl <= 720_000)   { nominalRate = 0.135; deduction = 17640; }
    else if (annualGrossBrl <= 1_800_000) { nominalRate = 0.160; deduction = 35640; }
    else if (annualGrossBrl <= 3_600_000) { nominalRate = 0.210; deduction = 125640; }
    else                                  { nominalRate = 0.330; deduction = 648000; }
  } else if (regime === 'anexo5') {
    if      (annualGrossBrl <= 180_000)   { nominalRate = 0.155; deduction = 0; }
    else if (annualGrossBrl <= 360_000)   { nominalRate = 0.180; deduction = 4500; }
    else if (annualGrossBrl <= 720_000)   { nominalRate = 0.195; deduction = 9900; }
    else if (annualGrossBrl <= 1_800_000) { nominalRate = 0.205; deduction = 17100; }
    else if (annualGrossBrl <= 3_600_000) { nominalRate = 0.230; deduction = 62100; }
    else                                  { nominalRate = 0.305; deduction = 540000; }
  }

  // Alíquota Efetiva = (Faturamento Anual * Alíquota Nominal - Parcela a Deduzir) / Faturamento Anual
  const effectiveRate = ((annualGrossBrl * nominalRate) - deduction) / annualGrossBrl;
  
  // Garantir que não seja negativa (não ocorre na prática na tabela do SN, mas por segurança)
  return Math.max(0, effectiveRate * 100);
}

// IRRF progressive table 2025/2026 (MP 1.294/2025 & Lei 15.270/2025)
// Brackets: 2428.80 / 2826.65 / 3751.05 / 4664.68
// Rates: 0 / 7.5 / 15 / 22.5 / 27.5%
// Deductions: 0 / 182.16 / 394.16 / 675.49 / 908.73
export function calcIRRF(irrfBase: number): number {
  if (irrfBase <= 5000) return 0 // Isenção total Lei 15.270/2025

  let cost: number
  if      (irrfBase <= 2428.80) cost = 0 // Coberto pela isenção acima, mas mantido na base
  else if (irrfBase <= 2826.65) cost = irrfBase * 0.075  - 182.16
  else if (irrfBase <= 3751.05) cost = irrfBase * 0.15   - 394.16
  else if (irrfBase <= 4664.68) cost = irrfBase * 0.225  - 675.49
  else                          cost = irrfBase * 0.275  - 908.73

  cost = cost < 0 ? 0 : cost

  // Redutor adicional Lei 15.270/2025 (Faixa 5.000 a 7.350)
  if (irrfBase > 5000 && irrfBase <= 7350) {
    const reducao = 978.62 - (0.133145 * irrfBase)
    cost = cost - reducao
    cost = cost < 0 ? 0 : cost
  }

  return cost
}

export function calcDeductions(params: CalcParams): DeductionResult {
  const { jobs, exchangeRate, remittanceFeePercent,
          dasTaxPercent, taxRegime = 'custom', accountingFee } = params

  const grossBrl        = jobs.reduce((acc, job) => acc + job.amount * (job.currency === 'USD' ? exchangeRate : 1), 0)
  const usdGrossBrl     = jobs.reduce((acc, job) => acc + (job.currency === 'USD' ? job.amount * exchangeRate : 0), 0)
  
  const annualGrossBrl  = grossBrl * 12
  const companyType     = getCompanyType(annualGrossBrl)

  const isMEI           = companyType === 'MEI'

  const remittanceCost  = usdGrossBrl * (remittanceFeePercent / 100)

  let finalDasPercent = dasTaxPercent
  if (!isMEI && taxRegime !== 'custom') {
    finalDasPercent = calcSimplesNacionalRate(annualGrossBrl, taxRegime)
  }

  const dasCost         = isMEI ? 75.60 : grossBrl * (finalDasPercent / 100)
  const proLabore       = isMEI ? 0 : grossBrl * 0.28
  const inssCost        = isMEI ? 0 : proLabore * 0.11
  const irrfBase        = isMEI ? 0 : proLabore - inssCost
  const irrfCost        = isMEI ? 0 : calcIRRF(irrfBase)

  const totalDeductions = remittanceCost + dasCost + inssCost + irrfCost + accountingFee
  const netIncomeBrl    = grossBrl - totalDeductions
  const effectiveTaxRate = grossBrl > 0
    ? Math.min(100, Math.max(0, (totalDeductions / grossBrl) * 100))
    : 0

  return {
    grossBrl, annualGrossBrl, companyType,
    remittanceCost, dasCost, proLabore,
    inssCost, irrfCost, accountingFee,
    totalDeductions, netIncomeBrl, effectiveTaxRate,
  }
}
