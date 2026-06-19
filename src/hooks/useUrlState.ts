import { useState, useEffect } from 'react'

export interface FormState {
  usdSalary: number
  exchangeRate: number
  remittanceFeePercent: number
  dasTaxPercent: number
  accountingFee: number
  livingCost: number
}

export function useUrlState(defaults: FormState): [FormState, React.Dispatch<React.SetStateAction<FormState>>] {
  const [state, setState] = useState<FormState>(() => {
    // Runs only on first render
    const params = new URLSearchParams(window.location.search)
    
    const usd  = parseFloat(params.get('usd')  ?? '')
    const rate = parseFloat(params.get('rate') ?? '')
    const fee  = parseFloat(params.get('fee')  ?? '')
    const das  = parseFloat(params.get('das')  ?? '')
    const acc  = parseFloat(params.get('acc')  ?? '')
    const lc   = parseFloat(params.get('lc')   ?? '')

    return {
      usdSalary:            isNaN(usd)  ? defaults.usdSalary            : usd,
      exchangeRate:         isNaN(rate) ? defaults.exchangeRate         : rate,
      remittanceFeePercent: isNaN(fee)  ? defaults.remittanceFeePercent : fee,
      dasTaxPercent:        isNaN(das)  ? defaults.dasTaxPercent        : das,
      accountingFee:        isNaN(acc)  ? defaults.accountingFee        : acc,
      livingCost:           isNaN(lc)   ? defaults.livingCost           : lc,
    }
  })

  useEffect(() => {
    // Skip replaceState if any value is invalid/NaN to avoid ?usd=NaN
    const { usdSalary, exchangeRate, remittanceFeePercent, dasTaxPercent, accountingFee, livingCost } = state
    
    if ([usdSalary, exchangeRate, remittanceFeePercent, dasTaxPercent, accountingFee, livingCost]
        .some(v => isNaN(v) || v === undefined || v === null)) return

    const params = new URLSearchParams({
      usd:  String(usdSalary),
      rate: String(exchangeRate),
      fee:  String(remittanceFeePercent),
      das:  String(dasTaxPercent),
      acc:  String(accountingFee),
      lc:   String(livingCost),
    })

    window.history.replaceState(null, '', '?' + params.toString())
  }, [state])

  return [state, setState]
}
