import type { DeductionResult } from './taxCalc'

export async function exportCsv(result: DeductionResult): Promise<void> {
  const rows = [
    ['Descrição', 'Valor'],
    ['Salário Bruto (BRL)', result.grossBrl.toFixed(2)],
    ['Gross Anual', result.annualGrossBrl.toFixed(2)],
    ['Regime', result.companyType],
    ['Custo Remessa', result.remittanceCost.toFixed(2)],
    ['DAS', result.dasCost.toFixed(2)],
    ['Pró-Labore', result.proLabore.toFixed(2)],
    ['INSS', result.inssCost.toFixed(2)],
    ['IRRF', result.irrfCost.toFixed(2)],
    ['Contabilidade', result.accountingFee.toFixed(2)],
    ['Total Deduções', result.totalDeductions.toFixed(2)],
    ['Renda Líquida', result.netIncomeBrl.toFixed(2)],
    ['Taxa Efetiva', `${result.effectiveTaxRate.toFixed(2)}%`],
  ]
  const csv  = '\uFEFF' + rows.map(r => r.join(';')).join('\n')  // BOM for Excel
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url, download: 'calculadora-pj-resultado.csv',
  })
  a.click()
  URL.revokeObjectURL(url)
}
