import { Calculator, SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  isDark: boolean;
  toggleDark: () => void;
  isUsingLiveRate: boolean;
  lastUpdated: string | null;
  refreshRate: () => void;
  rateLoading: boolean;
}

export function Header({
  isDark,
  toggleDark,
  isUsingLiveRate,
  lastUpdated,
  refreshRate,
  rateLoading,
}: HeaderProps) {
  return (
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
  );
}
