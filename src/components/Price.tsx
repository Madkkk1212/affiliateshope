'use client'

import { useCurrency } from './CurrencyProvider'

interface PriceProps {
  amount: string | number
  className?: string
}

export default function Price({ amount, className }: PriceProps) {
  const { rate, symbol, currency, loading } = useCurrency()
  
  const numericAmount = typeof amount === 'string' 
    ? Number(amount.replace(/[^0-9]/g, '')) 
    : amount

  if (loading) {
    // Show IDR as placeholder while loading
    return <span className={className}>Rp {new Intl.NumberFormat('id-ID').format(numericAmount)}</span>
  }

  const convertedAmount = numericAmount * rate

  // Gunakan Intl.NumberFormat untuk format yang cantik sesuai mata uang
  const formatted = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  }).format(convertedAmount)

  return (
    <span className={className}>
      {formatted}
    </span>
  )
}
