import { Wallet, Info } from './Icons';

interface ResultsPanelProps {
  grossBrl: number;
  annualGrossBrl: number;
  effectiveTaxRate: number;
  remittanceCost: number;
  remittanceFee: number;
  dasCost: number;
  dasTax: number;
  accountingFee: number;
  isMEI: boolean;
  proLabore: number;
  inssCost: number;
  irrfCost: number;
  netIncomeBrl: number;
  monthlyReserveCost: number;
  safeNetIncome: number;
  equivalentCLT: number;
}

export function ResultsPanel({
  grossBrl,
  annualGrossBrl,
  effectiveTaxRate,
  remittanceCost,
  remittanceFee,
  dasCost,
  dasTax,
  accountingFee,
  isMEI,
  proLabore,
  inssCost,
  irrfCost,
  netIncomeBrl,
  monthlyReserveCost,
  safeNetIncome,
  equivalentCLT,
}: ResultsPanelProps) {
  const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <>
      {/* Card Principal - Líquido */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-xl shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-2 -mr-2 text-white opacity-10">
          <Wallet size={100} />
        </div>
        <p className="text-indigo-100 text-sm font-medium mb-1 relative z-10">Líquido no Bolso (Estimativa)</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-0.5 relative z-10">{formatBRL(netIncomeBrl)} <span className="text-base md:text-lg font-normal text-indigo-200">/mês</span></h2>
        <p className="text-indigo-200 text-sm font-medium relative z-10">Ou {formatBRL(netIncomeBrl * 12)} /ano</p>
        
        <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-indigo-100 leading-tight">Bruto (Mês)</p>
            <p className="font-semibold text-sm">{formatBRL(grossBrl)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-indigo-100 leading-tight">Bruto (Ano)</p>
            <p className="font-semibold text-sm">{formatBRL(annualGrossBrl)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-indigo-100 leading-tight">Custo Total</p>
            <p className="font-semibold text-sm">{effectiveTaxRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Breakdown detalhado */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-3 border-b dark:border-slate-700 pb-1.5">Demonstrativo de Deduções</h3>
        
        <div className="space-y-1.5 font-mono text-[13px]">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>Faturamento Bruto (Mensal):</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{formatBRL(grossBrl)}</span>
          </div>
          
          <div className="flex justify-between text-red-500 dark:text-red-400 pt-1">
            <span>(-) Taxa Plataforma ({remittanceFee}%):</span>
            <span>- {formatBRL(remittanceCost)}</span>
          </div>
          
          <div className="flex justify-between text-red-500 dark:text-red-400">
            <span>(-) Imposto PJ DAS {isMEI ? '(Fixo)' : `(${dasTax}%)`}:</span>
            <span>- {formatBRL(dasCost)}</span>
          </div>
          
          <div className="flex justify-between text-red-500 dark:text-red-400">
            <span>(-) Contabilidade:</span>
            <span>- {formatBRL(accountingFee)}</span>
          </div>

          {/* Bloco Pró-labore - Oculto no MEI */}
          {!isMEI && (
            <div className="my-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between text-indigo-700 dark:text-indigo-400 font-semibold mb-1">
                <span>Pró-labore (28% Fator R):</span>
                <span>{formatBRL(proLabore)}</span>
              </div>
              <div className="flex justify-between text-red-500 dark:text-red-400 pl-3 border-l border-slate-200 dark:border-slate-700 text-xs">
                <span>(-) INSS PF (11%):</span>
                <span>- {formatBRL(inssCost)}</span>
              </div>
              <div className="flex justify-between text-red-500 dark:text-red-400 pl-3 border-l border-slate-200 dark:border-slate-700 text-xs mt-0.5">
                <span>(-) IRRF PF (Progr.):</span>
                <span>- {formatBRL(irrfCost)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-base font-bold text-slate-700 dark:text-slate-300 font-sans">
            <span>Líquido Mensal PJ:</span>
            <span>{formatBRL(netIncomeBrl)}</span>
          </div>

          <div className="flex justify-between text-indigo-500 dark:text-indigo-400 font-medium pb-1">
            <span>(-) Fundo de Segurança 1º Ano:</span>
            <span>- {formatBRL(monthlyReserveCost)}</span>
          </div>

          <div className="flex justify-between pt-1 text-base font-bold text-emerald-600 dark:text-emerald-400 font-sans border-t border-slate-200 dark:border-slate-700">
            <span>Líquido Disponível:</span>
            <span>{formatBRL(safeNetIncome)}</span>
          </div>

          {safeNetIncome > 0 && (
            <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-700/90 dark:text-emerald-300/80 flex items-start leading-tight">
              <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
              <span>Equivale a uma vaga <strong>CLT anunciada por {formatBRL(equivalentCLT)}/mês</strong>. 
              (Cálculo assume PJ com 30 dias de férias não remuneradas, e <strong>já deduz {formatBRL(monthlyReserveCost)}/mês</strong> do líquido para montar o fundo de emergência de 6 meses no 1º ano).</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
