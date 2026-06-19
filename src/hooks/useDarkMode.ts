import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  const toggle = () => {
    const root = document.documentElement
    const isDarkNow = root.classList.contains('dark')
    if (isDarkNow) {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  // Effect to listen for OS preference changes if no user preference is set
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        const root = document.documentElement
        if (e.matches) {
          root.classList.add('dark')
          setIsDark(true)
        } else {
          root.classList.remove('dark')
          setIsDark(false)
        }
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return { isDark, toggle }
}
