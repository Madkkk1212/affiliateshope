'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HookFiltersProps {
  categories: string[]
  initialQ: string
  initialCategory: string
  initialStatus: string
}

export default function HookFilters({ categories, initialQ, initialCategory, initialStatus }: HookFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(initialQ)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilter('q', q)
    }, 500)
    return () => clearTimeout(timer)
  }, [q])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari hook..." 
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
        />
      </div>
      <select 
        value={initialCategory}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="px-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm outline-none focus:border-primary transition-all font-bold text-gray-700"
      >
        <option value="">Semua Kategori</option>
        {categories?.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select 
        value={initialStatus}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="px-4 py-3 rounded-2xl border border-gray-100 bg-white shadow-sm outline-none focus:border-primary transition-all font-bold text-gray-700"
      >
        <option value="">Semua Status</option>
        <option value="draft">Draft</option>
        <option value="publish">Publish</option>
      </select>
    </div>
  )
}
