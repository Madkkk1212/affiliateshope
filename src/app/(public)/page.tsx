import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Sparkles, TrendingUp, Filter, CheckCircle2, ShieldCheck, Star } from 'lucide-react'
import Link from 'next/link'
import Pagination from '@/components/Pagination'
import CategoryNav from '@/components/CategoryNav'
import { Suspense } from 'react'
import Image from 'next/image'

export const revalidate = 3600 // Cache for 1 hour

interface CategoryStat {
  category_name: string
  product_count: number
  representative_image: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; page?: string; q?: string }>
}) {
  const { category, sort, page: pageStr, q: searchStr } = await searchParams
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

  if (searchStr) {
    // Memecah kata kunci berdasarkan spasi agar pencarian lebih fleksibel
    const keywords = searchStr.trim().split(/\s+/)
    keywords.forEach(keyword => {
      query = query.ilike('title', `%${keyword}%`)
    })
  }

  if (sort === 'popular') {
    query = query.order('clicks', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  // Use the new RPC for optimized category stats fetching
  let [productsRes, categoryStatsRes] = await Promise.all([
    query,
    supabase.rpc('get_category_stats')
  ])

  let categoryStats: CategoryStat[] | null = categoryStatsRes.data

  // FALLBACK: If RPC is missing (PGRST202), fetch categories the old way
  if (categoryStatsRes.error && categoryStatsRes.error.code === 'PGRST202') {
    const { data: fallbackData } = await supabase
      .from('products')
      .select('category, image')
      .eq('is_active', true)
    
    if (fallbackData) {
      const counts: Record<string, number> = {}
      const images: Record<string, string> = {}
      fallbackData.forEach(p => {
        if (p.category) {
          counts[p.category] = (counts[p.category] || 0) + 1
          if (!images[p.category] && p.image) images[p.category] = p.image
        }
      })
      categoryStats = Object.keys(counts).map(name => ({
        category_name: name,
        product_count: counts[name],
        representative_image: images[name]
      }))
    }
  }

  const { data: products, count } = productsRes

  const categoryCounts: Record<string, number> = {}
  const categoryImages: Record<string, string> = {}
  
  categoryStats?.forEach(stat => {
    if (stat.category_name) {
      categoryCounts[stat.category_name] = Number(stat.product_count)
      if (stat.representative_image) {
        categoryImages[stat.category_name] = stat.representative_image
      }
    }
  })

  const uniqueCategories = Object.keys(categoryCounts).sort()
  const totalActive = categoryStats?.reduce((acc, curr) => acc + Number(curr.product_count), 0) || 0

  return (
    <div className="bg-hero-gradient min-h-screen relative">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10 mix-blend-multiply overflow-hidden">
        <Image 
          src="/logo.png" 
          alt="Luma Hive Watermark" 
          width={1000}
          height={1000}
          className="w-[120%] sm:w-[80%] max-w-[1000px] object-contain rotate-[-5deg] grayscale"
          priority
        />
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-16">
          {/* Sidebar (Desktop Only) */}
          <div className="hidden lg:block w-full lg:w-[280px] xl:w-[320px] shrink-0 lg:sticky lg:top-28 z-10 transition-all duration-500">
            <Suspense fallback={<div className="h-96 w-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl rounded-[2rem] animate-pulse"></div>}>
              <CategoryNav 
                uniqueCategories={uniqueCategories}
                categoryCounts={categoryCounts}
                categoryImages={categoryImages}
                totalActive={totalActive}
                currentCategory={category}
                currentSort={sort}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full transition-all duration-500">
            {/* Hero Section */}
            <section className="mb-12 lg:mb-16 mt-4 lg:mt-0 lg:pr-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-0">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-50/80 border border-orange-200 text-orange-600 text-xs font-bold mb-6 lg:mb-8 animate-fade-in shadow-sm">
                  <Sparkles size={16} className="text-orange-500 animate-pulse" />
                  <span className="uppercase tracking-widest">Terpercaya & Terkurasi 100%</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl xl:text-[3.6rem] font-black tracking-tight mb-5 lg:mb-7 leading-[1.12] text-balance">
                  Belanja Cerdas Tepat Sasaran, <br className="hidden lg:block" />
                  <span className="text-orange-600">Hemat Waktu & Uang Anda.</span>
                </h1>
                
                <p className="text-gray-600 text-base sm:text-lg xl:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed text-balance mb-10">
                  Berhenti pusing memilih dari ribuan barang online. Kami menyeleksi ketat produk dengan rating tertinggi dan harga paling masuk akal khusus untuk Anda. <strong className="text-gray-900 font-bold">Biar kami yang repot mencari, Anda tinggal pilih yang pasti-pasti aja.</strong>
                </p>

                {/* CTA Button */}
                <div className="flex justify-center lg:justify-start mb-10">
                  <a 
                    href="#product-grid" 
                    className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-orange-600/30 transform hover:-translate-y-1 transition-all"
                  >
                    Yuk, Intip Koleksinya
                  </a>
                </div>

                {/* Trust Indicators - Unified Pill */}
                <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-sm font-bold text-gray-700 bg-white/60 backdrop-blur-md px-6 py-4 rounded-full border border-gray-200 shadow-sm mx-auto lg:mx-0">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100/80 text-green-600 p-1.5 rounded-full">
                      <CheckCircle2 size={16} />
                    </div>
                    <span>Kualitas Teruji</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100/80 text-blue-600 p-1.5 rounded-full">
                      <Star size={16} />
                    </div>
                    <span>Rating Tertinggi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-100/80 text-orange-600 p-1.5 rounded-full">
                      <ShieldCheck size={16} />
                    </div>
                    <span>Belanja Aman</span>
                  </div>
                </div>
              </div>

              {/* Cool Aesthetic Image on the Right - Bento Grid */}
              <div className="hidden lg:block w-full lg:w-[45%] relative">
                {/* Decorative blob behind bento */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-gray-200 to-primary/10 opacity-50 blur-3xl rounded-full -z-10 animate-pulse"></div>
                
                <div className="relative w-full aspect-square xl:aspect-[4/3] rounded-[2rem] p-3 bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl shadow-gray-300/40">
                  <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full w-full">
                    {/* Top Left: Tech / Keyboard */}
                    <div className="rounded-2xl overflow-hidden bg-gray-900 group relative shadow-inner">
                      <Image 
                        src="https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop" 
                        alt="Tech" 
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    {/* Top Right: Shoes */}
                    <div className="rounded-2xl overflow-hidden bg-gray-100 group relative shadow-inner">
                      <Image 
                        src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop" 
                        alt="Shoes" 
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    {/* Bottom Left: Perfume */}
                    <div className="rounded-2xl overflow-hidden bg-gray-100 group relative shadow-inner">
                      <Image 
                        src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" 
                        alt="Perfume" 
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    {/* Bottom Right: EDC */}
                    <div className="rounded-2xl overflow-hidden bg-gray-100 group relative shadow-inner">
                      <Image 
                        src="https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=800&auto=format&fit=crop" 
                        alt="Accessories" 
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile Sidebar (CategoryNav) */}
            <div className="block lg:hidden w-full shrink-0 z-10 transition-all duration-500 mb-8 sm:mb-12">
              <Suspense fallback={<div className="h-24 w-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm rounded-2xl animate-pulse"></div>}>
                <CategoryNav 
                  uniqueCategories={uniqueCategories}
                  categoryCounts={categoryCounts}
                  categoryImages={categoryImages}
                  totalActive={totalActive}
                  currentCategory={category}
                  currentSort={sort}
                />
              </Suspense>
            </div>

            {/* Product Grid */}
            {products && products.length > 0 ? (
              <>
                <div id="product-grid" key={category || 'all'} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} priority={index < 4} />
                  ))}
                </div>
                
                <Suspense fallback={<div className="h-12 w-full flex items-center justify-center gap-2 animate-pulse mt-8"><div className="w-8 h-8 rounded-lg bg-gray-200"></div></div>}>
                  <Pagination 
                    currentPage={page} 
                    totalCount={count || 0} 
                    pageSize={pageSize} 
                  />
                </Suspense>
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[2rem] border border-gray-100 shadow-soft w-full">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-50 mb-6 transition-transform hover:scale-110 duration-300">
                  <Filter size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Belum Ada Produk</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Kami sedang menyiapkan produk menarik untuk kategori ini. Kembali lagi nanti ya!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
