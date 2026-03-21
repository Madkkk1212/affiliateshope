import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Sparkles, TrendingUp, Filter } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/Pagination'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; page?: string }>
}) {
  const { category, sort, page: pageStr } = await searchParams
  const page = parseInt(pageStr || '1')
  const pageSize = 12 // Using 12 for grid alignment (2, 3, 4 cols)
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

  // Apply pagination at the very end
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data: products, count } = await query

  const { data: allActiveProducts } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true)

  const categoryCounts: Record<string, number> = {}
  allActiveProducts?.forEach(p => {
    if (p.category) {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
    }
  })

  const uniqueCategories = Object.keys(categoryCounts).sort()
  const totalActive = allActiveProducts?.length || 0

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
          <Sparkles size={16} />
          <span>Rekomendasi Terbaik Hari Ini</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Temukan <span className="text-primary">Produk Pilihan</span> Untuk Gaya Hidup Anda
        </h1>
        <p className="text-gray-500 text-lg">
          Koleksi produk berkualitas tinggi yang telah dikurasi khusus untuk Anda. Hemat waktu dengan rekomendasi terpercaya.
        </p>
      </section>

      {/* Filters & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Link 
            href="/"
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${!category ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
          >
            <span>Semua</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!category ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
              {totalActive}
            </span>
          </Link>
          {uniqueCategories.map((cat) => (
            <Link 
              key={cat}
              href={`/?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${category === cat ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-100'}`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${category === cat ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                {categoryCounts[cat]}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Urutkan:</span>
          <select 
            className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer"
            defaultValue={sort || 'latest'}
            // In a real app, use a client component or router.push
          >
            <option value="latest">Terbaru</option>
            <option value="popular">Terpopuler</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
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
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
            <Filter size={32} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Belum Ada Produk</h3>
          <p className="text-gray-500">Kami sedang menyiapkan produk menarik untuk Anda.</p>
        </div>
      )}
    </div>
  )
}
