'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition, useEffect } from 'react'
import { LayoutGrid } from 'lucide-react'
import GoogleTranslate from './GoogleTranslate'
import HeroSearch from './HeroSearch'

export default function Navbar() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Ultra-smooth transitional effect on the product grid for home clicks
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
        grid.style.opacity = '1'
        grid.style.filter = 'blur(0px)'
        grid.style.transform = 'scale(1)'
        grid.style.pointerEvents = 'auto'
      }
    }
  }, [isPending])

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push('/')
    })
  }

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        <a 
          href="/" 
          onClick={handleHomeClick} 
          className="group flex items-center gap-2 sm:gap-3 outline-none shrink-0"
        >
          <img 
            src="/logo.png" 
            alt="Logo" 
            className={`h-10 sm:h-12 w-auto object-contain transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isPending ? 'scale-95 opacity-50 blur-[2px] animate-pulse' : 'group-hover:scale-105 group-active:scale-95'}`}
          />
          <div className={`flex flex-col transition-all duration-500 ease-out ${isPending ? 'opacity-50 blur-[1px]' : 'group-hover:opacity-90'}`}>
            <span className="text-base sm:text-lg font-black tracking-tight leading-none text-gray-900">
              Lumahive
            </span>
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.15em] text-primary leading-none mt-1 uppercase">
              Rekomendasi
            </span>
          </div>
        </a>

        {/* Global Desktop Search View */}
        <div className="hidden md:block flex-1 max-w-2xl px-4 lg:px-8">
          <HeroSearch />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <GoogleTranslate />
        </div>
      </div>
      
      {/* Mobile Global Search View */}
      <div className="md:hidden w-full px-4 pb-3">
        <HeroSearch />
      </div>
    </nav>
  )
}
