'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'

export default function HeroSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
  const [isPending, startTransition] = useTransition()

  // Ultra-smooth transitional effect on the product grid for search
  useEffect(() => {
    const grid = document.getElementById('product-grid')
    if (grid) {
      if (isPending) {
        grid.style.opacity = '0.5'
        grid.style.filter = 'blur(4px)'
        grid.style.transform = 'scale(0.98)'
        grid.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        grid.style.pointerEvents = 'none'
      } else {
        grid.removeAttribute('style')
      }
    }
  }, [isPending])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim())
      } else {
        params.delete('q')
      }
      params.delete('page') // reset page to 1
      
      router.push(`/?${params.toString()}`, { scroll: false })
      
      // Smooth scroll back to grid top after filtering
      setTimeout(() => {
         document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    })
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        {isPending ? (
          <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
        )}
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Semua yang kamu mau ada..."
        disabled={isPending}
        className="w-full pl-12 pr-[100px] py-3 rounded-full border-2 border-gray-100 bg-white/90 backdrop-blur-md text-sm sm:text-base text-gray-900 shadow-sm focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium placeholder:text-gray-400 disabled:opacity-70"
      />
      <div className="absolute inset-y-1.5 right-1.5 flex items-center">
        <button
          type="submit"
          disabled={isPending}
          className="h-full px-5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full transition-all disabled:opacity-50 disabled:hover:bg-orange-600 shadow-sm shadow-orange-600/30 text-sm"
        >
          Cari
        </button>
      </div>
    </form>
  )
}
