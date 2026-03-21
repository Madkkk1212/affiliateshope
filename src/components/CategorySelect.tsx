'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORY_GROUPS } from '@/constants/categories'
import { Search, ChevronDown, Check, X } from 'lucide-react'

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategorySelect({ value, onChange, placeholder = 'Pilih Kategori' }: CategorySelectProps) {
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

  const filteredGroups = CATEGORY_GROUPS.map(group => ({
    ...group,
    categories: group.categories.filter(cat => 
      cat.toLowerCase().includes(search.toLowerCase()) || 
      group.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.categories.length > 0)

  const handleSelect = (category: string) => {
    onChange(category)
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
        className={`w-full px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
          isOpen ? 'bg-white border-primary ring-4 ring-primary/10' : 'bg-gray-50 border-gray-100'
        }`}
      >
        <span className={value ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium'}>
          {value || placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto pt-1 pb-2">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.name} className="mb-2 last:mb-0">
                  <div className="px-4 py-1 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                    {group.name}
                  </div>
                  <div className="mt-1">
                    {group.categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => handleSelect(cat)}
                        className={`px-4 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-primary/5 transition-colors ${
                          value === cat ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600'
                        }`}
                      >
                        <span>{cat}</span>
                        {value === cat && <Check size={14} />}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                Kategori tidak ditemukan.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
