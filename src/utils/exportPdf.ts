import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { DeductionResult } from './taxCalc'

const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export async function exportPdf(result: DeductionResult): Promise<void> {
  const doc = new jsPDF()
  autoTable(doc, {
    head: [['Descrição', 'Valor']],
    body: [
      ['Salário Bruto (BRL)', formatBRL(result.grossBrl)],
      ['Gross Anual', formatBRL(result.annualGrossBrl)],
      ['Regime', result.companyType],
      ['Custo Remessa', formatBRL(result.remittanceCost)],
      ['DAS', formatBRL(result.dasCost)],
      ['Pró-Labore', formatBRL(result.proLabore)],
      ['INSS', formatBRL(result.inssCost)],
      ['IRRF', formatBRL(result.irrfCost)],
      ['Contabilidade', formatBRL(result.accountingFee)],
      ['Total Deduções', formatBRL(result.totalDeductions)],
      ['Renda Líquida', formatBRL(result.netIncomeBrl)],
      ['Taxa Efetiva', `${result.effectiveTaxRate.toFixed(2)}%`],
    ],
  })
  doc.save('calculadora-pj-resultado.pdf')
}
