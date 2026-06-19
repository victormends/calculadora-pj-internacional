export type CompanyType = 'MEI' | 'ME' | 'EPP' | 'OUT'

// MEI ceiling (kept at 81,000 to match current active legislation)
export const MEI_CEILING = 81_000
export const ME_CEILING  = 360_000
export const EPP_CEILING = 4_800_000

export interface CalcParams {
  usdSalary: number
  exchangeRate: number
  remittanceFeePercent: number   // e.g. 1.5 = 1.5%
  dasTaxPercent: number          // e.g. 6.0 = 6.0%
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
  const { usdSalary, exchangeRate, remittanceFeePercent,
          dasTaxPercent, accountingFee } = params

  const grossBrl        = usdSalary * exchangeRate
  const annualGrossBrl  = grossBrl * 12
  const companyType     = getCompanyType(annualGrossBrl)

  const isMEI           = companyType === 'MEI'

  const remittanceCost  = grossBrl * (remittanceFeePercent / 100)
  const dasCost         = isMEI ? 75.60 : grossBrl * (dasTaxPercent / 100)
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
