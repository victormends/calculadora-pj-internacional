import { useState, useEffect } from 'react'

export interface Job {
  id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'BRL';
}

export interface FormState {
  jobs: Job[];
  usdExchangeRate: number
  eurExchangeRate: number
  remittanceFeePercent: number
  dasTaxPercent: number
  taxRegime?: 'anexo3' | 'anexo5' | 'custom'
  accountingFee: number
  livingCost: number
  enableSecurityReserve: boolean
}

export function useUrlState(defaults: FormState): [FormState, React.Dispatch<React.SetStateAction<FormState>>] {
  const [state, setState] = useState<FormState>(() => {
    // Runs only on first render
    const params = new URLSearchParams(window.location.search)
    
    const rate = parseFloat(params.get('rate') ?? '')
    const eurRate = parseFloat(params.get('eurRate') ?? '')
    const fee  = parseFloat(params.get('fee')  ?? '')
    const das  = parseFloat(params.get('das')  ?? '')
    const acc  = parseFloat(params.get('acc')  ?? '')
    const lc   = parseFloat(params.get('lc')   ?? '')
    const sec  = params.get('sec')
    const regime = params.get('reg') as FormState['taxRegime'] | null

    let initialJobs: Job[] = []
    
    // Check for new format (j1, c1, j2, c2, j3, c3)
    for (let i = 1; i <= 3; i++) {
      const jAmt = parseFloat(params.get(`j${i}`) ?? '')
      const jCur = params.get(`c${i}`) as 'USD' | 'EUR' | 'BRL' | null
      if (!isNaN(jAmt)) {
        initialJobs.push({
          id: `url-job-${i}`,
          amount: jAmt,
          currency: jCur === 'BRL' ? 'BRL' : jCur === 'EUR' ? 'EUR' : 'USD'
        })
      }
    }

    // Legacy fallback
    if (initialJobs.length === 0) {
      const legacyUsd = parseFloat(params.get('usd') ?? '')
      if (!isNaN(legacyUsd)) {
        initialJobs.push({ id: 'legacy-job', amount: legacyUsd, currency: 'USD' })
      } else {
        initialJobs = defaults.jobs
      }
    }

    return {
      jobs:                 initialJobs,
      usdExchangeRate:      isNaN(rate) ? defaults.usdExchangeRate      : rate,
      eurExchangeRate:      isNaN(eurRate) ? defaults.eurExchangeRate   : eurRate,
      remittanceFeePercent: isNaN(fee)  ? defaults.remittanceFeePercent : fee,
      dasTaxPercent:        isNaN(das)  ? defaults.dasTaxPercent        : das,
      taxRegime:            regime      ? regime                        : defaults.taxRegime,
      accountingFee:        isNaN(acc)  ? defaults.accountingFee        : acc,
      livingCost:           isNaN(lc)   ? defaults.livingCost           : lc,
      enableSecurityReserve: sec !== null ? sec === 'true' : defaults.enableSecurityReserve,
    }
  })

  useEffect(() => {
    const { jobs, usdExchangeRate, eurExchangeRate, remittanceFeePercent, dasTaxPercent, accountingFee, livingCost, taxRegime, enableSecurityReserve } = state
    
    if ([usdExchangeRate, eurExchangeRate, remittanceFeePercent, dasTaxPercent, accountingFee, livingCost]
        .some(v => isNaN(v) || v === undefined || v === null)) return

    const params = new URLSearchParams({
      rate: String(usdExchangeRate),
      eurRate: String(eurExchangeRate),
      fee:  String(remittanceFeePercent),
      das:  String(dasTaxPercent),
      acc:  String(accountingFee),
      lc:   String(livingCost),
      sec:  String(enableSecurityReserve),
    })
    
    jobs.forEach((job, index) => {
      params.append(`j${index + 1}`, String(job.amount))
      params.append(`c${index + 1}`, job.currency)
    })
    
    if (taxRegime) {
      params.append('reg', taxRegime)
    }

    window.history.replaceState(null, '', '?' + params.toString())
  }, [state])

  return [state, setState]
}
