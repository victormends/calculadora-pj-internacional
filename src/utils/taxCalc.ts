export type CompanyType = 'MEI' | 'ME' | 'EPP' | 'OUT'

// MEI ceiling corrected from 150,000 to 130,000
export const MEI_CEILING = 130_000
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
 * Calcula o salário Bruto CLT equivalente para equiparar ao Líquido PJ.
 * Considera: 13º, terço de férias, FGTS (8%) e R$ 1.500/mês de benefícios (VR, VA, Saúde, etc).
 * Fórmula: Anual_PJ = Bruto_CLT * 13.33 * (0.76 + 0.08) + Benefícios_Anuais
 */
export function calcEquivalentCLT(netIncomeMonthlyBrl: number): number {
  const annualNetPJ = netIncomeMonthlyBrl * 12
  const annualBenefits = 1500 * 12 // Benefícios médios isentos
  
  // O coeficiente 11.2 vem de: 13.33 salários * 0.84 (76% líquido + 8% FGTS)
  const equivalentGross = (annualNetPJ - annualBenefits) / 11.2
  
  return equivalentGross > 0 ? equivalentGross : 0
}

export function getCompanyType(annualGrossBrl: number): CompanyType {
  if (annualGrossBrl <= MEI_CEILING)  return 'MEI'
  if (annualGrossBrl <= ME_CEILING)   return 'ME'
  if (annualGrossBrl <= EPP_CEILING)  return 'EPP'
  return 'OUT'
}

// IRRF progressive table 2024/2025
// Brackets: 2259.20 / 2826.65 / 3751.05 / 4664.68
// Rates: 0 / 7.5 / 15 / 22.5 / 27.5%
// Deductions: 0 / 169.44 / 381.44 / 662.77 / 896.00
export function calcIRRF(irrfBase: number): number {
  let cost: number
  if      (irrfBase <= 2259.20) cost = 0
  else if (irrfBase <= 2826.65) cost = irrfBase * 0.075  - 169.44
  else if (irrfBase <= 3751.05) cost = irrfBase * 0.15   - 381.44
  else if (irrfBase <= 4664.68) cost = irrfBase * 0.225  - 662.77
  else                           cost = irrfBase * 0.275  - 896.00
  return cost < 0 ? 0 : cost   // negative guard
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
