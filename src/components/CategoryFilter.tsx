'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { CATEGORY_GROUPS } from '@/constants/categories'
import { Filter, ChevronDown, Search, Check, X } from 'lucide-react'

interface CategoryFilterProps {
  categoryCounts: Record<string, number>;
}

export default function CategoryFilter({ categoryCounts }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || ''
  
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter groups to only show those that have active categories with products
  const filteredGroups = CATEGORY_GROUPS.map(group => ({
    ...group,
    categories: group.categories.filter(cat => {
      const hasProducts = (categoryCounts[cat] || 0) > 0;
      const matchesSearch = cat.toLowerCase().includes(search.toLowerCase()) || 
                           group.name.toLowerCase().includes(search.toLowerCase());
      return hasProducts && matchesSearch;
    })
  })).filter(group => group.categories.length > 0)

  const handleSelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm transition-all cursor-pointer hover:border-primary/30 ${
          isOpen ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-white border-gray-100'
        }`}
      >
        <Filter size={16} className={currentCategory ? 'text-primary' : 'text-gray-400'} />
        <span className={`text-sm font-bold truncate max-w-[120px] ${currentCategory ? 'text-gray-900' : 'text-gray-500'}`}>
          {currentCategory || 'Semua Kategori'}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari kategori..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto pt-1 pb-2">
            <div
              onClick={() => handleSelect('')}
              className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 transition-colors ${
                !currentCategory ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600'
              }`}
            >
              <span>Semua Kategori</span>
              {!currentCategory && <Check size={14} />}
            </div>

            {filteredGroups.map((group) => (
              <div key={group.name} className="mt-2 mb-1 last:mb-0">
                <div className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  {group.name}
                </div>
                <div className="mt-1">
                  {group.categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => handleSelect(cat)}
                        className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 transition-colors ${
                          currentCategory === cat ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{cat}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                            {categoryCounts[cat]}
                          </span>
                        </div>
                        {currentCategory === cat && <Check size={14} />}
                      </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
