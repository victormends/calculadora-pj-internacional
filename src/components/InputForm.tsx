import { DollarSign, CheckIcon, LinkIcon } from './Icons';
import type { Job } from '../hooks/useUrlState';

export interface FormState {
  jobs: Job[];
  exchangeRate: number;
  remittanceFeePercent: number;
  dasTaxPercent: number;
  taxRegime?: 'anexo3' | 'anexo5' | 'custom';
  accountingFee: number;
  livingCost: number;
  enableSecurityReserve: boolean;
}

interface InputFormProps {
  formState: FormState;
  setFormState: (state: FormState) => void;
  handleCopyLink: () => void;
  copied: boolean;
  isUsingLiveRate: boolean;
  liveRate: number | null;
  isMEI: boolean;
  computedDasTax?: number;
}

export function InputForm({
  formState,
  setFormState,
  handleCopyLink,
  copied,
  isUsingLiveRate,
  liveRate,
  isMEI,
  computedDasTax,
}: InputFormProps) {
  const { exchangeRate, remittanceFeePercent: remittanceFee, dasTaxPercent: dasTax, accountingFee, livingCost } = formState;

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
        <div className="space-y-2">
          {formState.jobs.map((job, idx) => (
            <div key={job.id} className="flex gap-2 items-end">
              <div className="w-[72px] flex-shrink-0">
                {idx === 0 && <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Moeda</label>}
                <select
                  value={job.currency}
                  onChange={(e) => {
                    const newJobs = [...formState.jobs];
                    newJobs[idx] = { ...newJobs[idx], currency: e.target.value as 'USD' | 'BRL' };
                    setFormState({ ...formState, jobs: newJobs });
                  }}
                  className="w-full px-1 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-slate-600 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="USD">USD</option>
                  <option value="BRL">BRL</option>
                </select>
              </div>

              <div className="flex-1">
                {idx === 0 && <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mensal</label>}
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-sm">{job.currency === 'USD' ? '$' : 'R$'}</span>
                  <input
                    type="number"
                    value={job.amount ? parseFloat(job.amount.toFixed(2)) : ''}
                    onChange={(e) => {
                      const newJobs = [...formState.jobs];
                      newJobs[idx] = { ...newJobs[idx], amount: Number(e.target.value) };
                      setFormState({ ...formState, jobs: newJobs });
                    }}
                    className="w-full pl-6 pr-1 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="flex-1">
                {idx === 0 && <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Anual</label>}
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 text-sm">{job.currency === 'USD' ? '$' : 'R$'}</span>
                  <input
                    type="number"
                    value={job.amount ? parseFloat((job.amount * 12).toFixed(2)) : ''}
                    onChange={(e) => {
                      const newJobs = [...formState.jobs];
                      newJobs[idx] = { ...newJobs[idx], amount: Number(e.target.value) / 12 };
                      setFormState({ ...formState, jobs: newJobs });
                    }}
                    className="w-full pl-6 pr-1 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              {formState.jobs.length > 1 ? (
                <button
                  onClick={() => {
                    const newJobs = formState.jobs.filter((_, i) => i !== idx);
                    setFormState({ ...formState, jobs: newJobs });
                  }}
                  className="p-1.5 mb-[1px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Remover"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              ) : (
                <div className="w-[28px]"></div>
              )}
            </div>
          ))}
          {formState.jobs.length < 3 && (
            <button
              onClick={() => {
                setFormState({
                  ...formState,
                  jobs: [...formState.jobs, { id: `job-${Date.now()}`, amount: 0, currency: 'USD' }]
                });
              }}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center mt-1"
            >
              + Adicionar Emprego
            </button>
          )}
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

        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Qual a sua área de atuação?
          </label>
          <select
            value={formState.taxRegime || 'custom'}
            onChange={(e) => setFormState({ ...formState, taxRegime: e.target.value as FormState['taxRegime'] })}
            disabled={isMEI}
            className="w-full px-3 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800/50 dark:text-white"
          >
            <option value="anexo3" className="dark:bg-slate-800">Desenvolvimento, Suporte, Design (Anexo III)</option>
            <option value="anexo5" className="dark:bg-slate-800">Consultoria, Engenharia (Anexo V)</option>
            <option value="custom" className="dark:bg-slate-800">Personalizado (Digitar alíquota manualmente)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className={isMEI ? 'opacity-50' : ''}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alíquota DAS (%)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={formState.taxRegime !== 'custom' && formState.taxRegime !== undefined && computedDasTax !== undefined ? computedDasTax.toFixed(2) : dasTax}
                onChange={(e) => setFormState({ ...formState, dasTaxPercent: Number(e.target.value) })}
                disabled={isMEI || (formState.taxRegime !== 'custom' && formState.taxRegime !== undefined)}
                className="w-full pl-3 pr-6 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800/50 dark:text-white disabled:text-slate-500"
              />
              <span className="absolute right-2.5 top-2 text-slate-400 text-sm">%</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
              {isMEI ? 'MEI: Valor fixo' : (formState.taxRegime !== 'custom' && formState.taxRegime !== undefined) ? 'Calculado pela receita anual' : 'Isenção ISS/PIS (Geralmente 3.05%)'}
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
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Calcular Fundo de Segurança
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formState.enableSecurityReserve}
                onChange={(e) => setFormState({ ...formState, enableSecurityReserve: e.target.checked })}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          
          <div className={`transition-opacity duration-200 ${!formState.enableSecurityReserve ? 'opacity-40 pointer-events-none' : ''}`}>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
              Custo de Vida Mensal (R$)
              <span className="text-[10px] text-slate-400 ml-1 font-normal">(p/ cálculo de 6 meses)</span>
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 text-slate-400 text-sm">R$</span>
              <input 
                type="number" 
                value={livingCost || ''}
                placeholder="4000"
                onChange={(e) => setFormState({ ...formState, livingCost: Number(e.target.value) })}
                disabled={!formState.enableSecurityReserve}
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-transparent border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder-slate-300 dark:placeholder-slate-600 disabled:bg-slate-50 dark:disabled:bg-slate-800/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
