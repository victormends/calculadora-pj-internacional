import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DeductionResult } from './taxCalc';
import type { FormState } from '../components/InputForm';

const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatUSD = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export interface ExportPdfParams {
  result: DeductionResult;
  formState: FormState;
  safeNetIncome: number;
  equivalentCLT: number;
  monthlyReserveCost: number;
}

export async function exportPdf({
  result,
  formState,
  safeNetIncome,
  equivalentCLT,
  monthlyReserveCost,
}: ExportPdfParams): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Colors
  const indigo = [79, 70, 229] as [number, number, number];
  const emerald = [16, 185, 129] as [number, number, number];
  const slate = [71, 85, 105] as [number, number, number];

  // Header
  doc.setFontSize(22);
  doc.setTextColor(indigo[0], indigo[1], indigo[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Calculadora PJ Internacional', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(slate[0], slate[1], slate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório Gerencial de Estimativa de Ganhos - Regime: ${result.companyType}`, 14, yPos);
  
  yPos += 6;
  doc.setFontSize(9);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, yPos);

  yPos += 15;

  // Parâmetros Base
  autoTable(doc, {
    startY: yPos,
    head: [['Parâmetros Base', 'Valor']],
    body: [
      ['Faturamento Mensal (USD)', formatUSD(formState.usdSalary)],
      ['Cotação Aplicada (BRL)', `R$ ${formState.exchangeRate.toFixed(2)}`],
      ['Custo de Vida Declarado', formatBRL(formState.livingCost)],
    ],
    theme: 'plain',
    headStyles: { fillColor: [241, 245, 249], textColor: slate, fontStyle: 'bold' },
    bodyStyles: { textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 10, bottom: 10, left: 14, right: 14 },
    tableWidth: 'auto',
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Receitas
  autoTable(doc, {
    startY: yPos,
    head: [['Receitas Brutas', 'Mensal', 'Anual']],
    body: [
      ['Faturamento Bruto', formatBRL(result.grossBrl), formatBRL(result.annualGrossBrl)],
    ],
    theme: 'striped',
    headStyles: { fillColor: emerald, textColor: [255, 255, 255], fontStyle: 'bold' },
    bodyStyles: { textColor: [15, 23, 42], fontStyle: 'bold' },
    margin: { top: 10, bottom: 10, left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Deduções
  const isMEI = result.companyType === 'MEI';
  const deductionsBody = [
    ['Taxa de Plataforma / Remessa', `(${formState.remittanceFeePercent}%)`, `- ${formatBRL(result.remittanceCost)}`],
    ['Imposto PJ (DAS)', isMEI ? '(Fixo)' : `(${formState.dasTaxPercent}%)`, `- ${formatBRL(result.dasCost)}`],
    ['Contabilidade', '', `- ${formatBRL(result.accountingFee)}`],
  ];

  if (!isMEI) {
    deductionsBody.push(
      ['Pró-labore (Fator R 28%)', '', formatBRL(result.proLabore)],
      ['INSS PF', '(11%)', `- ${formatBRL(result.inssCost)}`],
      ['IRRF PF', '(Progressivo)', `- ${formatBRL(result.irrfCost)}`]
    );
  }

  deductionsBody.push(['', 'Custo Efetivo Total', `${result.effectiveTaxRate.toFixed(1)}%`]);

  autoTable(doc, {
    startY: yPos,
    head: [['Deduções & Custos', 'Detalhe', 'Valor']],
    body: deductionsBody,
    theme: 'striped',
    headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42], fontStyle: 'bold' },
    bodyStyles: { textColor: [71, 85, 105] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { textColor: [239, 68, 68] }, // Red for deductions
    },
    margin: { top: 10, bottom: 10, left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Resultado Líquido & Segurança
  const summaryBody = [
    ['Líquido PJ no Bolso (Mês)', formatBRL(result.netIncomeBrl)],
    ['Líquido PJ no Bolso (Ano)', formatBRL(result.netIncomeBrl * 12)],
  ];

  if (safeNetIncome > 0) {
    summaryBody.push(
      ['Fundo de Segurança (Mês 1º Ano)', `- ${formatBRL(monthlyReserveCost)}`],
      ['Líquido Seguro Disponível', formatBRL(safeNetIncome)],
      ['Salário CLT Equivalente', formatBRL(equivalentCLT)]
    );
  }

  autoTable(doc, {
    startY: yPos,
    head: [['Resumo Financeiro & Segurança', 'Valor']],
    body: summaryBody,
    theme: 'grid',
    headStyles: { fillColor: indigo, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 12 },
    bodyStyles: { textColor: [15, 23, 42], fontSize: 11 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { fontStyle: 'bold', halign: 'right' },
    },
    didParseCell: function(data) {
      // Highlight CLT row
      if (data.row.index === summaryBody.length - 1 && safeNetIncome > 0) {
        data.cell.styles.fillColor = [224, 231, 255]; // Indigo-100
        data.cell.styles.textColor = indigo;
      }
      // Highlight Safe Net Income row
      if (data.row.index === summaryBody.length - 2 && safeNetIncome > 0) {
        data.cell.styles.textColor = emerald;
      }
    },
    margin: { top: 10, bottom: 10, left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Footer Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'italic');
  doc.text('Este relatório é uma simulação educacional e não substitui o aconselhamento de um contador profissional.', pageWidth / 2, 280, { align: 'center' });

  doc.save('relatorio-estimativa-pj.pdf');
}
