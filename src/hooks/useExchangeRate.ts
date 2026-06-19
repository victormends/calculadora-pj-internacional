import { useState, useEffect, useCallback } from 'react'

export interface RateState {
  rate: number
  loading: boolean
  lastUpdated: string | null   // "HH:MM" local time
  isLive: boolean
  error: string | null
  refresh: () => void
}

const FALLBACK_RATE = 5.50
const ENDPOINT = 'https://economia.awesomeapi.com.br/json/last/USD-BRL'

async function fetchRate(): Promise<number> {
  const res  = await fetch(ENDPOINT)
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  const raw  = parseFloat(data?.USDBRL?.bid)
  
  if (isNaN(raw) || raw <= 0 || raw > 50) {
    throw new Error(`Unexpected rate value: ${data?.USDBRL?.bid}`)
  }
  return raw
}

export function useExchangeRate(): RateState {
  const [rate, setRate] = useState(FALLBACK_RATE)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedRate = await fetchRate()
      setRate(fetchedRate)
      setIsLive(true)
      const now = new Date()
      setLastUpdated(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
    } catch (err: any) {
      setRate(FALLBACK_RATE)
      setIsLive(false)
      setError(err.message || 'Error fetching rate')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { rate, loading, lastUpdated, isLive, error, refresh }
}
