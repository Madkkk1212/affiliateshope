'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

export default function Pagination({ currentPage, totalCount, pageSize }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(totalCount / pageSize)

  const [isPending, startTransition] = useTransition()
  const [optimisticPage, setOptimisticPage] = useState(currentPage)

  // Sync optimistic state with actual server-rendered page prop
  useEffect(() => {
    setOptimisticPage(currentPage)
  }, [currentPage])

  // Ultra-smooth transitional effect on the product grid for pagination
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

  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    if (page === optimisticPage) return
    setOptimisticPage(page)
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())
      router.push(`/?${params.toString()}`, { scroll: false })
      
      // Smooth scroll back to grid top
      setTimeout(() => {
        document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    })
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-14 mb-8">
      <button
        onClick={() => handlePageChange(optimisticPage - 1)}
        disabled={optimisticPage <= 1 || isPending}
        className="flex items-center justify-center w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100/50 text-gray-400 hover:text-orange-500 hover:border-orange-200 disabled:opacity-40 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm group"
      >
        <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <div className="flex items-center gap-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={isPending}
            className={`flex items-center justify-center w-12 h-12 rounded-[1.2rem] text-lg font-black transition-all duration-300 ${
              page === optimisticPage
                ? 'bg-[#ff5722] text-white shadow-xl shadow-[#ff5722]/40 scale-110'
                : 'bg-white border border-gray-100/50 text-slate-500 hover:bg-gray-50 hover:text-slate-800 hover:shadow-md'
            }`}
          >
            {isPending && page === optimisticPage ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              page
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => handlePageChange(optimisticPage + 1)}
        disabled={optimisticPage >= totalPages || isPending}
        className="flex items-center justify-center w-12 h-12 rounded-[1.2rem] bg-white border border-gray-100/50 text-gray-400 hover:text-orange-500 hover:border-orange-200 disabled:opacity-40 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm group"
      >
        <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}
