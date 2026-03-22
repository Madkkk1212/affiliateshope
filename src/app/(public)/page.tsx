import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Sparkles, TrendingUp, Filter } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/Pagination'

export const revalidate = 3600 // Cache for 1 hour

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>
}) {
  const { category, sort, page: pageStr } = await searchParams
  const page = parseInt(pageStr || '1')
  const pageSize = 12
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  if (category) {
    query = query.eq('category', category)
  }

  if (sort === 'popular') {
    query = query.order('clicks', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data: products, count } = await query

  // Optimize category counting: only fetch what's needed
  const { data: allActiveCategories } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)

  const categoryCounts: Record<string, number> = {}
  allActiveCategories?.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    }
  })

  const uniqueCategories = Object.keys(categoryCounts).sort()
  const totalActive = allActiveCategories?.length || 0

  return (
    <div className="bg-hero-gradient min-h-screen">
      <div className="container mx-auto px-4 py-12 sm:py-20">
        {/* Hero Section */}
        <section className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-xs font-bold mb-8 border border-primary/10 animate-fade-in">
            <Sparkles size={14} />
            <span className="uppercase tracking-widest">Premium Curation</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1] text-balance">
            Temukan <span className="text-primary italic">Produk Pilihan</span> <br className="hidden sm:block" /> Untuk Gaya Hidup Anda
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed text-balance">
            Koleksi produk berkualitas tinggi yang telah dikurasi khusus untuk Anda. Hemat waktu dengan rekomendasi dari expert kami.
          </p>
        </section>

        {/* Filters & Sorting */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            <Link 
              href="/"
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 ${!category ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 border border-gray-100 hover:border-primary/30 hover:shadow-soft'}`}
            >
              <span>Semua</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-lg ${!category ? 'bg-white/20' : 'bg-gray-100 text-gray-400 font-medium'}`}>
                {totalActive}
              </span>
            </Link>
            {uniqueCategories.map((cat) => (
              <Link 
                key={cat}
                href={`/?category=${encodeURIComponent(cat)}`}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2.5 ${category === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-600 border border-gray-100 hover:border-primary/30 hover:shadow-soft'}`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg ${category === cat ? 'bg-white/20' : 'bg-gray-100 text-gray-400 font-medium'}`}>
                  {categoryCounts[cat]}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-soft self-start lg:self-auto">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Urutkan</span>
            <select 
              className="bg-transparent text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-2"
              defaultValue={sort || 'latest'}
            >
              <option value="latest">Terbaru</option>
              <option value="popular">Terpopuler</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-16">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <Pagination 
              currentPage={page} 
              totalCount={count || 0} 
              pageSize={pageSize} 
            />
          </>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-soft">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6">
              <Filter size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Belum Ada Produk</h3>
            <p className="text-gray-400 max-w-xs mx-auto">Kami sedang menyiapkan produk menarik untuk kategori ini. Kembali lagi nanti ya!</p>
          </div>
        )}
      </div>
    </div>
  )
}
