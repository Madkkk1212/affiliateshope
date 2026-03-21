'use client'

import { useState } from 'react'
import { ShoppingCart, Loader2, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductCTAProps {
  productId: string
  affiliateUrl: string
  title?: string
  sticky?: boolean
  className?: string
}

export default function ProductCTA({ 
  productId, 
  affiliateUrl, 
  title = "Beli Sekarang", 
  sticky = false,
  className 
}: ProductCTAProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      // Small delay to show loading state (UX)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Call click tracking API
      await fetch('/api/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      // Redirect to affiliate URL
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Click tracking failed:', error)
      // Fallback: still redirect even if tracking fails
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      sticky ? "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 sm:relative sm:p-0 sm:bg-transparent sm:border-0 z-40" : "",
      className
    )}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg",
          loading && "opacity-90 cursor-wait"
        )}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={24} />
        ) : (
          <ShoppingCart size={24} />
        )}
        <span>{loading ? "Menuju Toko..." : title}</span>
        {!loading && <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />}
      </button>
    </div>
  )
}
