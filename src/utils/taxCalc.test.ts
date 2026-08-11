import { describe, it, expect } from 'vitest'
import { getCompanyType, calcIRRF, calcDeductions } from './taxCalc'

describe('getCompanyType', () => {
  it('1. annualGross = 81,000 → MEI', () => {
    expect(getCompanyType(81_000)).toBe('MEI')
  })
  it('2. annualGross = 81,001 → ME', () => {
    expect(getCompanyType(81_001)).toBe('ME')
  })
  it('3. annualGross = 360,000 → ME', () => {
    expect(getCompanyType(360_000)).toBe('ME')
  })
  it('4. annualGross = 360,001 → EPP', () => {
    expect(getCompanyType(360_001)).toBe('EPP')
  })
  it('5. annualGross = 4,800,001 → OUT', () => {
    expect(getCompanyType(4_800_001)).toBe('OUT')
  })
})

describe('calcIRRF', () => {
  it('6. IRRF base <= 5000 → 0 tax (Isenção total Lei 15.270/2025)', () => {
    expect(calcIRRF(5000)).toBe(0)
  })
  it('7. IRRF base = 6000', () => {
    // cost = 6000 * 0.275 - 908.73 = 741.27
    // reducao = 978.62 - (0.133145 * 6000) = 179.75
    // final cost = 741.27 - 179.75 = 561.52
    expect(calcIRRF(6000)).toBeCloseTo(561.52, 2)
  })
  it('8. IRRF base = 8000 (Sem redutor adicional)', () => {
    expect(calcIRRF(8000)).toBeCloseTo(8000 * 0.275 - 908.73, 2)
  })
  it('9. Negative IRRF guard', () => {
    expect(calcIRRF(2260)).toBeGreaterThanOrEqual(0)
  })
})

describe('calcDeductions', () => {
  const baseParams = {
    usdSalary: 5000,
    exchangeRate: 5.0,
    remittanceFeePercent: 1.0,
    dasTaxPercent: 6.0,
    accountingFee: 500
  }

  it('10. proLabore = 28% of grossBrl (for ME/EPP/OUT)', () => {
    const res = calcDeductions(baseParams)
    expect(res.proLabore).toBeCloseTo(res.grossBrl * 0.28, 2)
  })

  it('11. INSS = 11% of proLabore (for ME/EPP/OUT)', () => {
    const res = calcDeductions(baseParams)
    expect(res.inssCost).toBeCloseTo(res.proLabore * 0.11, 2)
  })

  it('12. usdSalary = 0 → no income, fixed fees remain (MEI DAS + Accounting)', () => {
    const res = calcDeductions({ ...baseParams, usdSalary: 0 })
    expect(res.companyType).toBe('MEI')
    expect(res.totalDeductions).toBeCloseTo(575.60, 2) // 500 acc + 75.60 DAS
    expect(res.netIncomeBrl).toBeCloseTo(-575.60, 2)
    expect(res.grossBrl).toBe(0)
  })

  it('13. effectiveTaxRate in [0, 100]', () => {
    const res = calcDeductions(baseParams)
    expect(res.effectiveTaxRate).toBeGreaterThanOrEqual(0)
    expect(res.effectiveTaxRate).toBeLessThanOrEqual(100)
  })

  it('14. totalDeductions = exact sum of all 5 cost fields', () => {
    const res = calcDeductions(baseParams)
    const exactSum = res.remittanceCost + res.dasCost + res.inssCost + res.irrfCost + res.accountingFee
    expect(res.totalDeductions).toBeCloseTo(exactSum, 5)
  })

  it('15. Known-input end-to-end regression anchor', () => {
    // USD 5000 * 5.0 = 25000. 1% fee, 6% DAS, acc 500
    const res = calcDeductions(baseParams)
    
    expect(res.grossBrl).toBeCloseTo(25000, 2)
    expect(res.remittanceCost).toBeCloseTo(250, 2)
    expect(res.dasCost).toBeCloseTo(1500, 2)
    expect(res.proLabore).toBeCloseTo(7000, 2)
    expect(res.inssCost).toBeCloseTo(770, 2)
    
    // irrfBase = 7000 - 770 = 6230
    // cost = 6230 * 0.275 - 908.73 = 804.52
    // reducao = 978.62 - (0.133145 * 6230) = 149.127
    // final = 804.52 - 149.127 = 655.39
    expect(res.irrfCost).toBeCloseTo(655.39, 2)
    
    // total = 250 + 1500 + 770 + 655.39 + 500 = 3675.39
    expect(res.totalDeductions).toBeCloseTo(3675.39, 2)
    
    // net = 25000 - 3675.39 = 21324.61
    expect(res.netIncomeBrl).toBeCloseTo(21324.61, 2)
    
    // effectiveTaxRate = (3675.39 / 25000) * 100 = 14.7015
    expect(res.effectiveTaxRate).toBeCloseTo(14.70, 1)
  })
})
