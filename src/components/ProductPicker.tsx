'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Check, Plus, X } from 'lucide-react'

interface ProductPickerProps {
  category: string
  selectedIds: string[]
  onSelect: (productId: string) => void
  onRemove: (productId: string) => void
}

export default function ProductPicker({ category, selectedIds, onSelect, onRemove }: ProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
      if (!category) {
        setProducts([])
        return
      }
      setLoading(true)
      try {
        let query = supabase
          .from('products')
          .select('id, title, image, price, discount_price, category, clicks')
          .eq('category', category)
          .order('clicks', { ascending: false })

        if (search) {
          query = query.ilike('title', `%${search}%`)
        }

        const { data, error } = await query.limit(20)
        if (error) throw error
        setProducts(data || [])
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(true) // Actually should be false, fixed below
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchProducts, 300)
    return () => clearTimeout(timer)
  }, [category, search])

  return (
    <>
      <button 
        type="button"
        disabled={!category}
        onClick={() => setIsOpen(true)}
        className="w-full py-4 px-6 bg-white border-2 border-dashed border-gray-100 rounded-[2rem] flex items-center justify-between group hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={20} />
          </div>
          <span className="font-bold text-gray-500 group-hover:text-primary">Tambahkan Produk</span>
        </div>
        <div className="text-xs font-black text-gray-300 uppercase tracking-widest">
          {category || 'Pilih Kategori Dahulu'}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-black text-gray-900">Pilih Produk</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Kategori: {category}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 shrink-0">
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="Cari produk terpopuler..."
                />
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
              </div>
            </div>

            {/* Product List (Scrollable) */}
            <div className="flex-grow overflow-y-auto px-6 pb-6 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              ) : products.length > 0 ? (
                <div className="grid gap-4">
                  {products.map((p) => {
                    const isSelected = selectedIds.includes(p.id)
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => isSelected ? onRemove(p.id) : onSelect(p.id)}
                        className={`p-4 rounded-[1.5rem] border transition-all cursor-pointer flex items-center gap-4 group ${
                          isSelected 
                            ? 'bg-primary/5 border-primary shadow-sm' 
                            : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-md'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden shrink-0 relative">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                          {p.clicks > 0 && (
                            <div className="absolute top-1 left-1 bg-orange-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase">
                               Hot
                            </div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-primary">{(p.discount_price || p.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{p.clicks} Klik</span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary text-white scale-110' : 'bg-gray-50 text-gray-300'
                        }`}>
                          {isSelected ? <Check size={20} /> : <Plus size={20} />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 font-bold">
                  Tidak ada produk ditemukan.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-50 shrink-0 flex justify-between items-center">
              <div className="text-sm font-bold text-gray-500">
                <span className="text-primary font-black">{selectedIds.length}</span> Produk Terpilih
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="btn-primary py-3 px-8 rounded-2xl shadow-xl shadow-primary/20"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
