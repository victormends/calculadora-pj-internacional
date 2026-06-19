import { useState, useEffect, useRef } from 'react';
import { calcDeductions, calcEquivalentCLT } from './utils/taxCalc';
import { useExchangeRate } from './hooks/useExchangeRate';
import { useUrlState } from './hooks/useUrlState';
import { useDarkMode } from './hooks/useDarkMode';

const SunIcon = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
);

const MoonIcon = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
);

const LinkIcon = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);

const CheckIcon = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);

interface IconProps { size: number; className?: string; }

// Ícones SVG Inline (substituindo o lucide-react para garantir a renderização)
const Info = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);
const AlertTriangle = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const DollarSign = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const Calculator = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>
);
const Wallet = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
);

const Spinner = ({ size, className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
);

const initialParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
const initialRateParam = parseFloat(initialParams.get('rate') ?? '');
const globalInitialUrlRate = isNaN(initialRateParam) ? null : initialRateParam;

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { rate: liveRate, loading: rateLoading, lastUpdated, refresh: refreshRate } = useExchangeRate();

  const [formState, setFormState] = useUrlState({
    usdSalary: 2500,
    exchangeRate: 5.50,
    remittanceFeePercent: 2.0, // 2% Payoneer
    dasTaxPercent: 3.05, // 3.05% a 4%
    accountingFee: 250,
  });

  const { usdSalary, exchangeRate, remittanceFeePercent: remittanceFee, dasTaxPercent: dasTax, accountingFee } = formState;

  // Track if we successfully used URL rate param, initializing from the global evaluation
  const urlRateRef = useRef<number | null>(globalInitialUrlRate);

  // Sync initial rate once loaded if user hasn't overridden
  useEffect(() => {
    if (!rateLoading && liveRate && urlRateRef.current === null) {
       setFormState(s => ({ ...s, exchangeRate: liveRate }));
    }
  }, [liveRate, rateLoading, setFormState]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard API not available');
    }
  };

  // Lógica de Cálculo
  const result = calcDeductions({
    usdSalary,
    exchangeRate,
    remittanceFeePercent: remittanceFee,
    dasTaxPercent: dasTax,
    accountingFee
  });

  const {
    grossBrl, annualGrossBrl, companyType,
    remittanceCost, dasCost, proLabore,
    inssCost, irrfCost,
    netIncomeBrl, effectiveTaxRate
  } = result;

  const equivalentCLT = calcEquivalentCLT(netIncomeBrl);

  const isMEI = companyType === 'MEI';

  // Export handlers
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExportPdf() {
    setPdfLoading(true);
    setExportError(null);
    try {
      const { exportPdf } = await import('./utils/exportPdf');
      await exportPdf(result);
    } catch {
      setExportError('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleExportCsv() {
    setCsvLoading(true);
    setExportError(null);
    try {
      const { exportCsv } = await import('./utils/exportCsv');
      await exportCsv(result);
    } catch {
      setExportError('Erro ao exportar CSV. Tente novamente.');
    } finally {
      setCsvLoading(false);
    }
  }

  // Formatadores de moeda
  const formatBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isUsingLiveRate = liveRate ? Math.abs(exchangeRate - liveRate) < 0.001 : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-2 md:p-4 font-sans text-slate-800 dark:text-slate-200 transition-colors flex flex-col justify-center">
      <div className="max-w-6xl mx-auto w-full space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Calculadora PJ Internacional</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Simulador de ganhos líquidos para ME (Simples Nacional - Fator R)</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleDark}
              className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Alternar tema"
            >
              {isDark ? <SunIcon size={18} className="text-slate-400" /> : <MoonIcon size={18} className="text-slate-600" />}
            </button>
            <div className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center ${isUsingLiveRate ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {isUsingLiveRate ? (
                <>📡 Ao vivo · {lastUpdated}</>
              ) : (
                <>✏️ Cotação manual</>
              )}
            </div>
            <button 
              onClick={refreshRate} 
              disabled={rateLoading}
              className="p-1 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 text-xs"
              title="Atualizar cotação"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Alerta Regime Tributário (Compacto) */}
        {(() => {
          let regimeTitle = '';
          let regimeDesc = '';
          let styles = { bg: '', border: '', title: '', text: '', icon: '' };

          if (companyType === 'MEI') {
            regimeTitle = 'MEI';
            regimeDesc = 'Faturamento dentro do limite. DAS fixo (~R$75). Isento de IRPF com contabilidade.';
            styles = { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-500', title: 'text-emerald-800 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-500' };
          } else if (companyType === 'ME') {
            regimeTitle = 'ME (Simples Nacional)';
            regimeDesc = 'Faturamento entre R$ 130k e R$ 360k. Utilizando o Fator R (Pró-labore de 28%) para redução de impostos.';
            styles = { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-500', title: 'text-blue-800 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-400', icon: 'text-blue-500' };
          } else if (companyType === 'EPP') {
            regimeTitle = 'EPP (Simples Nacional)';
            regimeDesc = 'Faturamento entre R$ 360k e R$ 4,8M. Fator R aplicável, atenção ao aumento progressivo do DAS.';
            styles = { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-500', title: 'text-purple-800 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-400', icon: 'text-purple-500' };
          } else {
            regimeTitle = 'Fora do Simples (> R$ 4,8M)';
            regimeDesc = 'Faturamento excede o teto do Simples Nacional. Lucro Presumido ou Real aplicável.';
            styles = { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-500', title: 'text-red-800 dark:text-red-300', text: 'text-red-700 dark:text-red-400', icon: 'text-red-500' };
          }

          return (
            <div className={`border-l-4 p-2.5 rounded-r-lg flex items-center space-x-2 transition-colors ${styles.bg} ${styles.border}`}>
              {companyType === 'OUT' ? (
                <AlertTriangle className={`${styles.icon} shrink-0`} size={16} />
              ) : (
                <Info className={`${styles.icon} shrink-0`} size={16} />
              )}
              <div className="flex flex-col md:flex-row md:items-center text-sm">
                <span className={`font-semibold mr-2 ${styles.title}`}>Regime: {regimeTitle}</span>
                <span className={`text-xs md:text-sm ${styles.text}`}>{regimeDesc}</span>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Coluna Esquerda - Inputs */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-semibold flex items-center dark:text-slate-100">
                  <DollarSign size={18} className="text-emerald-500 mr-2" />
                  Variáveis da Receita
                </h2>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2 py-1 rounded-md transition-colors"
                >
                  {copied ? (
                    <><CheckIcon size={14} /> <span>Copiado!</span></>
                  ) : (
                    <><LinkIcon size={14} /> <span>Copiar link</span></>
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mensal (USD)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        value={usdSalary ? parseFloat(usdSalary.toFixed(2)) : ''}
                        onChange={(e) => setFormState({ ...formState, usdSalary: Number(e.target.value) })}
                        className="w-full pl-6 pr-2 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Anual (USD)</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-sm">$</span>
                      <input 
                        type="number" 
                        value={usdSalary ? parseFloat((usdSalary * 12).toFixed(2)) : ''}
                        onChange={(e) => setFormState({ ...formState, usdSalary: Number(e.target.value) / 12 })}
                        className="w-full pl-6 pr-2 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                      <span>Cotação Dólar (R$)</span>
                      {!isUsingLiveRate && liveRate && (
                        <button 
                          onClick={() => {
                            urlRateRef.current = liveRate;
                            setFormState({ ...formState, exchangeRate: liveRate });
                          }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                        >
                          Usar atual ({liveRate.toFixed(2)})
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={exchangeRate}
                        onChange={(e) => {
                          urlRateRef.current = Number(e.target.value); // Prevent overwrite from late liveRate
                          setFormState({ ...formState, exchangeRate: Number(e.target.value) });
                        }}
                        className={`w-full pl-8 pr-2 py-1.5 text-sm bg-transparent border ${isUsingLiveRate ? 'border-emerald-300 dark:border-emerald-600/50' : 'border-slate-300 dark:border-slate-600'} rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Taxa Remessa (%)
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={remittanceFee}
                        onChange={(e) => setFormState({ ...formState, remittanceFeePercent: Number(e.target.value) })}
                        className="w-full pl-3 pr-6 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                      <span className="absolute right-2.5 top-2 text-slate-400 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Payoneer ~2%, Husky ~0.5%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className={isMEI ? 'opacity-50' : ''}>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Alíquota DAS (%)
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.01"
                        value={dasTax}
                        onChange={(e) => setFormState({ ...formState, dasTaxPercent: Number(e.target.value) })}
                        disabled={isMEI}
                        className="w-full pl-3 pr-6 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800/50 dark:text-white"
                      />
                      <span className="absolute right-2.5 top-2 text-slate-400 text-sm">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {isMEI ? 'MEI: Valor fixo' : 'Isenção ISS/PIS (Geralmente 3.05%)'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Contabilidade (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-slate-400 text-sm">R$</span>
                      <input 
                        type="number" 
                        value={accountingFee}
                        onChange={(e) => setFormState({ ...formState, accountingFee: Number(e.target.value) })}
                        className="w-full pl-8 pr-2 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resultados */}
          <div className="space-y-4">
            
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

                <div className="flex justify-between pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-base font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                  <span>Líquido Mensal:</span>
                  <span>{formatBRL(netIncomeBrl)}</span>
                </div>
                {netIncomeBrl > 0 && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-700/90 dark:text-emerald-300/80 flex items-start leading-tight">
                    <Info size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>Equivale a salário <strong>Bruto CLT de {formatBRL(equivalentCLT)}</strong> (inclui 13º, férias, FGTS e ~R$1.5k VR/VA).</span>
                  </div>
                )}
              </div>

              {/* Export Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-col items-center">
                <div className="flex justify-center space-x-4 w-full">
                  <button 
                    onClick={handleExportPdf} 
                    disabled={pdfLoading || csvLoading}
                    className="flex-1 flex justify-center items-center py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {pdfLoading ? <Spinner size={16} className="mr-2" /> : <span className="mr-2">📄</span>}
                    Exportar PDF
                  </button>
                  <button 
                    onClick={handleExportCsv} 
                    disabled={csvLoading || pdfLoading}
                    className="flex-1 flex justify-center items-center py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    {csvLoading ? <Spinner size={16} className="mr-2" /> : <span className="mr-2">📊</span>}
                    Exportar CSV
                  </button>
                </div>
                {exportError && <p className="text-red-500 text-sm mt-3">{exportError}</p>}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}