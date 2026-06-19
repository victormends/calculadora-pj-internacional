import { describe, it, expect } from 'vitest'
import { getCompanyType, calcIRRF, calcDeductions } from './taxCalc'

describe('getCompanyType', () => {
  it('1. annualGross = 130,000 → MEI', () => {
    expect(getCompanyType(130_000)).toBe('MEI')
  })
  it('2. annualGross = 130,001 → ME', () => {
    expect(getCompanyType(130_001)).toBe('ME')
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
  it('6. IRRF base <= 2,259.20 → 0 tax', () => {
    expect(calcIRRF(2259.20)).toBe(0)
  })
  it('7. IRRF base in bracket 2 (7.5%)', () => {
    expect(calcIRRF(2500)).toBeCloseTo(2500 * 0.075 - 169.44, 2)
  })
  it('8. IRRF base in bracket 5 (27.5%)', () => {
    expect(calcIRRF(5000)).toBeCloseTo(5000 * 0.275 - 896.00, 2)
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
    // 6230 * 0.275 - 896 = 817.25
    expect(res.irrfCost).toBeCloseTo(817.25, 2)
    
    // total = 250 + 1500 + 770 + 817.25 + 500 = 3837.25
    expect(res.totalDeductions).toBeCloseTo(3837.25, 2)
    
    // net = 25000 - 3837.25 = 21162.75
    expect(res.netIncomeBrl).toBeCloseTo(21162.75, 2)
    
    // effectiveTaxRate = (3837.25 / 25000) * 100 = 15.349
    expect(res.effectiveTaxRate).toBeCloseTo(15.349, 3)
  })
})
