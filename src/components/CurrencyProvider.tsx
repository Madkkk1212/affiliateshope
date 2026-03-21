'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface CurrencyContextType {
  rate: number
  currency: string
  symbol: string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextType>({
  rate: 1,
  currency: 'IDR',
  symbol: 'Rp',
  loading: true,
})

export const useCurrency = () => useContext(CurrencyContext)

// Mapping sederhana Locale -> Currency
const localeToCurrency: Record<string, string> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'ja-JP': 'JPY',
  'zh-CN': 'CNY',
  'ms-MY': 'MYR',
  'ar-SA': 'SAR',
  'id-ID': 'IDR',
}

const currencySymbols: Record<string, string> = {
  'USD': '$',
  'GBP': '£',
  'JPY': '¥',
  'CNY': '¥',
  'MYR': 'RM',
  'SAR': 'SR',
  'IDR': 'Rp',
}

export default function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CurrencyContextType>({
    rate: 1,
    currency: 'IDR',
    symbol: 'Rp',
    loading: true,
  })

  useEffect(() => {
    let lastGoogTrans = ''

    async function updateCurrency() {
      try {
        // 1. Ambil Cookie Google Translate (googtrans)
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };

        const googTrans = getCookie('googtrans') || ''
        if (googTrans === lastGoogTrans && state.currency !== 'IDR' && !state.loading) return
        lastGoogTrans = googTrans

        // 2. Tentukan target bahasa (misal 'en' dari '/id/en')
        let targetLang = navigator.language.split('-')[0]
        if (googTrans) {
          const parts = googTrans.split('/')
          if (parts.length >= 3) targetLang = parts[2]
        }

        const detectedCurrency = localeToCurrency[targetLang] || 
                                localeToCurrency[targetLang.split('-')[0]] || 
                                (targetLang === 'id' ? 'IDR' : 'USD')
        
        if (detectedCurrency === 'IDR') {
          setState({ rate: 1, currency: 'IDR', symbol: 'Rp', loading: false })
          return
        }

        // 3. Ambil Kurs
        const res = await fetch('https://open.er-api.com/v6/latest/IDR')
        const data = await res.json()
        
        if (data && data.rates && data.rates[detectedCurrency]) {
          setState({
            rate: data.rates[detectedCurrency],
            currency: detectedCurrency,
            symbol: currencySymbols[detectedCurrency] || detectedCurrency,
            loading: false,
          })
        }
      } catch (error) {
        console.error('Currency Sync Error:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    // Jalankan pertama kali
    updateCurrency()

    // Cek perubahan bahasa setiap 1 detik (karena Google Translate ganti cookie tanpa event)
    const interval = setInterval(updateCurrency, 1000)
    return () => clearInterval(interval)
  }, [state.currency, state.loading])

  return (
    <CurrencyContext.Provider value={state}>
      {children}
    </CurrencyContext.Provider>
  )
}
