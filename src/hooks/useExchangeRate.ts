import { useState, useEffect, useCallback } from 'react'

export interface RateState {
  usdRate: number
  eurRate: number
  loading: boolean
  lastUpdated: string | null   // "HH:MM" local time
  isLive: boolean
  error: string | null
  refresh: () => void
}

const FALLBACK_USD_RATE = 5.50
const FALLBACK_EUR_RATE = 6.00
const ENDPOINT = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL'

async function fetchRates(): Promise<{usd: number, eur: number}> {
  const res  = await fetch(ENDPOINT)
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  
  const rawUsd  = parseFloat(data?.USDBRL?.bid)
  const rawEur  = parseFloat(data?.EURBRL?.bid)
  
  if (isNaN(rawUsd) || rawUsd <= 0 || rawUsd > 50 || isNaN(rawEur) || rawEur <= 0 || rawEur > 50) {
    throw new Error('Unexpected rate value')
  }
  return { usd: rawUsd, eur: rawEur }
}

export function useExchangeRate(): RateState {
  const [usdRate, setUsdRate] = useState(FALLBACK_USD_RATE)
  const [eurRate, setEurRate] = useState(FALLBACK_EUR_RATE)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedRates = await fetchRates()
      setUsdRate(fetchedRates.usd)
      setEurRate(fetchedRates.eur)
      setIsLive(true)
      const now = new Date()
      setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    } catch (err: any) {
      setUsdRate(FALLBACK_USD_RATE)
      setEurRate(FALLBACK_EUR_RATE)
      setIsLive(false)
      setError(err.message || 'Error fetching rates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { usdRate, eurRate, loading, lastUpdated, isLive, error, refresh }
}
