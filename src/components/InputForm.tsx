import { DollarSign, CheckIcon, LinkIcon } from './Icons';

export interface FormState {
  usdSalary: number;
  exchangeRate: number;
  remittanceFeePercent: number;
  dasTaxPercent: number;
  accountingFee: number;
  livingCost: number;
}

interface InputFormProps {
  formState: FormState;
  setFormState: (state: FormState) => void;
  handleCopyLink: () => void;
  copied: boolean;
  isUsingLiveRate: boolean;
  liveRate: number | null;
  isMEI: boolean;
}

export function InputForm({
  formState,
  setFormState,
  handleCopyLink,
  copied,
  isUsingLiveRate,
  liveRate,
  isMEI,
}: InputFormProps) {
  const { usdSalary, exchangeRate, remittanceFeePercent: remittanceFee, dasTaxPercent: dasTax, accountingFee, livingCost } = formState;

  return (
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

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
            Custo de Vida Mensal (R$)
            <span className="text-[10px] text-slate-400 ml-1 font-normal">(p/ cálculo de segurança)</span>
          </label>
          <div className="relative">
            <span className="absolute left-2.5 top-2 text-slate-400 text-sm">R$</span>
            <input 
              type="number" 
              value={livingCost || ''}
              placeholder="4000"
              onChange={(e) => setFormState({ ...formState, livingCost: Number(e.target.value) })}
              className="w-full pl-8 pr-2 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
