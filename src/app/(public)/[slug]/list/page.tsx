import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Star, ExternalLink, CheckCircle2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HookProductListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch hook and its products
  const { data: hook } = await supabase
    .from('hooks')
    .select(`
      id, title, description,
      hook_products(
        position,
        products(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (!hook) notFound()

  // Sort products by position
  const sortedProducts = hook.hook_products
    ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
    .map((hp: any) => hp.products)
    .filter(Boolean) || []

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10 mix-blend-multiply overflow-hidden">
        <img 
          src="/logo.png" 
          alt="Luma Hive Watermark" 
          className="w-[120%] sm:w-[80%] max-w-[1000px] object-contain rotate-[-5deg] grayscale"
        />
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-20 flex items-center gap-4">
          <Link href={`/${slug}`} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div className="flex-grow min-w-0">
            <h1 className="text-xl font-black text-gray-900 truncate">{hook.title}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{sortedProducts.length} Produk Rekomendasi</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {sortedProducts.map((product: any, idx: number) => (
            <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-premium border border-gray-100 flex flex-col sm:flex-row gap-6 p-6 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
              {/* Product Image */}
              <div className="w-full sm:w-48 aspect-square rounded-3xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                {product.image ? (
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={48} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary border border-primary/10">
                  #{idx + 1} Best Choice
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-grow flex flex-col justify-between py-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-orange-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">5.0 (1000+)</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black text-primary">
                      {formatPrice(product.discount_price || product.price)}
                    </span>
                    {product.discount_price && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-6 text-green-600">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold">Ready Stock & Free Shipping</span>
                  </div>
                </div>

                <Link 
                  href={product.affiliate_url} 
                  target="_blank"
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  <span className="font-black">Beli di Shopee</span>
                  <ExternalLink size={18} />
                </Link>
              </div>
            </div>
          ))}

          {sortedProducts.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag size={64} className="mx-auto text-gray-200" />
              <p className="text-gray-400 font-bold">Belum ada produk yang ditambahkan ke hook ini.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-gray-400 text-xs font-medium px-8">
          Halaman ini berisi tautan affiliate. Kami mungkin mendapatkan komisi kecil dari pembelian Anda tanpa biaya tambahan bagi Anda.
        </div>
      </div>
    </div>
  )
}
