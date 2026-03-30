'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { TrendingUp, Loader2, Search, LayoutGrid, X } from 'lucide-react'
import Image from 'next/image'

interface CategoryNavProps {
  uniqueCategories: string[];
  categoryCounts: Record<string, number>;
  categoryImages?: Record<string, string>;
  totalActive: number;
  currentCategory: string | undefined;
  currentSort: string | undefined;
}

export default function CategoryNav({
  uniqueCategories,
  categoryCounts,
  categoryImages,
  totalActive,
  currentCategory,
  currentSort
}: CategoryNavProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Optimistic UI state for instant feedback
  const [optimisticCategory, setOptimisticCategory] = useState(currentCategory)
  const [categorySearch, setCategorySearch] = useState('')
  const [showMobileMore, setShowMobileMore] = useState(false)

  // Mobile Top Categories Logic (4 Box Layout)
  const sortedMobileCats = [...uniqueCategories].sort((a,b) => categoryCounts[b] - categoryCounts[a])
  let displayMobileCats: string[] = []
  if (optimisticCategory && optimisticCategory !== 'Semua Koleksi') {
     displayMobileCats.push(optimisticCategory)
     const others = sortedMobileCats.filter(c => c !== optimisticCategory)
     displayMobileCats.push(...others.slice(0, 2))
  } else {
     displayMobileCats = sortedMobileCats.slice(0, 3)
  }

  // Sync with actual URL state when it changes (server response received)
  useEffect(() => {
    setOptimisticCategory(currentCategory)
  }, [currentCategory])

  // Ultra-smooth transitional effect on the product grid
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

  const handleCategoryClick = (category: string | undefined) => {
    if (optimisticCategory === category) return // Prevent redundant clicks

    // Instantly update UI locally
    setOptimisticCategory(category)

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      params.delete('page') // Reset to page 1 on category change
      router.push(`/?${params.toString()}`)
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      const val = e.target.value
      if (val === 'latest') {
        params.delete('sort')
      } else {
        params.set('sort', val)
      }
      params.delete('page') // Reset to page 1 on sort change
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full lg:bg-white/40 lg:backdrop-blur-xl lg:border lg:border-white/60 lg:shadow-xl lg:shadow-gray-200/50 lg:rounded-[2rem] lg:p-6 transition-all">
      <div className="flex flex-col gap-8">
        
        {/* Sort Section (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center justify-between flex-col items-start w-full bg-transparent p-0 relative">
          <div className="flex items-center gap-2 mb-3 w-full">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Urutkan Berdasarkan</span>
          </div>
          <select 
            className="bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-900 rounded-xl focus:outline-none px-4 py-2 cursor-pointer w-full text-left pr-2 transition-all focus:ring-2 focus:ring-primary/20 appearance-none"
            value={currentSort || 'latest'}
            onChange={handleSortChange}
            disabled={isPending}
            style={{ opacity: isPending ? 0.5 : 1 }}
          >
            <option value="latest">Terbaru</option>
            <option value="popular">Terpopuler</option>
          </select>
          {isPending && (
            <div className="absolute top-8 right-2 bg-primary/10 rounded-full p-2 animate-pulse shadow-sm">
              <Loader2 size={12} className="text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="bg-white lg:bg-transparent lg:border-none rounded-3xl border border-gray-100 lg:p-0 shadow-soft lg:shadow-none flex flex-col">
          <div className="mb-3 hidden lg:block">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pilih Kategori</h3>
          </div>

          <div className="px-5 lg:px-0 mb-4 hidden lg:block">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Cari kategori..." 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full bg-white/60 border border-gray-200 shadow-sm rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 placeholder:text-gray-400"
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Desktop Vertical List */}
          <div className="hidden lg:flex lg:flex-col gap-1.5 scroll-smooth lg:max-h-[60vh] lg:overflow-y-auto w-full">
            <button 
              onClick={() => handleCategoryClick(undefined)}
              className={`shrink-0 lg:px-4 lg:py-3 lg:rounded-2xl lg:text-sm font-bold transition-all duration-300 flex items-center justify-between lg:gap-3 lg:w-full ${!optimisticCategory ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 border border-transparent hover:border-white/50 lg:bg-transparent bg-gray-50/50'}`}
            >
              <span className="truncate">Semua Koleksi</span>
              <span className={`lg:text-[10px] lg:px-2.5 lg:py-1 rounded-md max-w-fit shrink-0 font-black ${!optimisticCategory ? 'bg-white/20 text-white' : 'bg-white/60 text-gray-500 shadow-sm'}`}>
                {totalActive}
              </span>
            </button>
            
            {uniqueCategories
              .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
              .map((cat) => (
              <button 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`shrink-0 lg:px-4 lg:py-3 lg:rounded-2xl lg:text-sm font-bold transition-all duration-300 flex items-center justify-between lg:gap-3 lg:w-full ${optimisticCategory === cat ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 border border-transparent hover:border-white/50 lg:bg-transparent bg-gray-50/50'}`}
              >
                <span className="truncate">{cat}</span>
                <span className={`lg:text-[10px] lg:px-2.5 lg:py-1 rounded-md max-w-fit shrink-0 font-black ${optimisticCategory === cat ? 'bg-white/20 text-white' : 'bg-white/60 text-gray-500 shadow-sm'}`}>
                  {categoryCounts[cat]}
                </span>
              </button>
            ))}
            
            {uniqueCategories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
              <div className="py-6 text-center text-sm font-medium text-gray-400 bg-white/50 rounded-xl border border-gray-100 border-dashed">
                Kategori tidak ditemukan
              </div>
            )}
          </div>

          {/* Mobile 4-Box Grid (Replaces Side Scroller) */}
          <div className="lg:hidden px-4 mb-2">
            <div className="grid grid-cols-4 gap-3">
              {displayMobileCats.map(cat => (
                 <button 
                   key={cat} 
                   onClick={() => handleCategoryClick(cat)}
                   className={`flex flex-col items-center gap-1.5 transition-all ${optimisticCategory === cat ? 'scale-105 filter drop-shadow-md' : 'opacity-90 hover:opacity-100'}`}
                 >
                   <div className={`w-full aspect-square rounded-2xl overflow-hidden shadow-sm border-[3px] relative ${optimisticCategory === cat ? 'border-orange-500' : 'border-transparent bg-white'}`}>
                     {categoryImages?.[cat] ? (
                       <Image src={categoryImages[cat]} alt={cat} fill className="object-cover" sizes="25vw" />
                     ) : (
                       <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-400">
                         <LayoutGrid size={24} />
                       </div>
                     )}
                   </div>
                   <span className={`text-[10px] font-bold text-center leading-tight line-clamp-2 ${optimisticCategory === cat ? 'text-orange-600' : 'text-gray-600'}`}>
                     {cat}
                   </span>
                 </button>
              ))}
              
              {/* "Lainnya" Button */}
              <button 
                onClick={() => setShowMobileMore(true)}
                className="flex flex-col items-center gap-1.5 transition-all opacity-90 hover:opacity-100"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-500">
                  <LayoutGrid size={22} className="mb-0.5 text-orange-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 leading-none">{uniqueCategories.length}</span>
                </div>
                <span className="text-[10px] font-bold text-center leading-tight text-gray-600">
                  Lainnya
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE "LAINNYA" BOTTOM SHEET POPUP */}
      {showMobileMore && (
        <div className="fixed inset-0 z-[100] lg:hidden flex flex-col justify-end">
          {/* Hide Navbar globally when this popup is open */}
          <style>{`
            nav {
              display: none !important;
            }
          `}</style>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileMore(false)} />
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col relative z-20 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex flex-col gap-4 sticky top-0 bg-white/90 backdrop-blur z-20 rounded-t-3xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xl text-gray-900 leading-none mb-1">Pilih Kategori</h3>
                  <p className="text-xs font-bold text-gray-400 tracking-wide uppercase">Temukan yang Anda cari</p>
                </div>
                <button onClick={() => setShowMobileMore(false)} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Category Search Input */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cari kategori..." 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 shadow-inner rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-700 placeholder:text-gray-400"
                />
                <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
              </div>
            </div>
            
            <div className="p-5 overflow-y-auto grid grid-cols-4 sm:grid-cols-4 gap-y-6 gap-x-3 pb-12">
               <button 
                 onClick={() => { handleCategoryClick(undefined); setShowMobileMore(false); }}
                 className={`flex flex-col items-center gap-2 ${!optimisticCategory ? 'opacity-100 scale-105 filter drop-shadow-md' : 'opacity-80 hover:opacity-100'}`}
               >
                 <div className={`w-full aspect-square rounded-2xl flex items-center justify-center text-white shadow-sm border-[3px] ${!optimisticCategory ? 'bg-orange-600 border-orange-200' : 'bg-gradient-to-br from-gray-400 to-gray-500 border-transparent'}`}>
                   <LayoutGrid size={28} />
                 </div>
                 <span className={`text-[10px] font-bold text-center leading-tight line-clamp-2 ${!optimisticCategory ? 'text-orange-600' : 'text-gray-600'}`}>Semua Koleksi</span>
               </button>
               
               {uniqueCategories
                 .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                 .map(cat => (
                 <button 
                   key={cat}
                   onClick={() => { handleCategoryClick(cat); setShowMobileMore(false); }}
                   className={`flex flex-col items-center gap-2 ${optimisticCategory === cat ? 'opacity-100 scale-105 filter drop-shadow-md' : 'opacity-80 hover:opacity-100'}`}
                 >
                   <div className={`w-full aspect-square rounded-2xl overflow-hidden shadow-sm border-[3px] bg-gray-50 relative ${optimisticCategory === cat ? 'border-orange-500' : 'border-transparent'}`}>
                     {categoryImages?.[cat] ? (
                       <Image src={categoryImages[cat]} alt={cat} fill className="object-cover" sizes="25vw" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300">
                         <LayoutGrid size={24} />
                       </div>
                     )}
                   </div>
                   <span className={`text-[10px] font-bold text-center leading-tight line-clamp-2 ${optimisticCategory === cat ? 'text-orange-600' : 'text-gray-600'}`}>
                     {cat}
                   </span>
                 </button>
               ))}
               
               {uniqueCategories.filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                 <div className="col-span-4 py-8 text-center text-sm font-medium text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                   Kategori tidak ditemukan
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
