import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, ShieldCheck, Truck, ArrowLeft } from 'lucide-react'
import ProductCTA from '@/components/ProductCTA'
import ProductGallery from '@/components/ProductGallery'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('title, description, image, images')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Produk Tidak Ditemukan' }

  return {
    title: `${product.title} | Lumahive Rekomendasi`,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description || '',
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="bg-white pb-24 sm:pb-12">
      {/* Back Button Mobile */}
      <div className="sm:hidden px-4 pt-4">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 font-medium">
          <ArrowLeft size={18} />
          <span>Kembali</span>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Product Image & Media */}
          <div className="space-y-6">
            <ProductGallery 
              images={product.images} 
              fallbackImage={product.image} 
              title={product.title} 
              badge={product.badge} 
            />
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <ShieldCheck className="text-primary mb-2" size={24} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-gray-500">Terpercaya</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <Truck className="text-primary mb-2" size={24} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-gray-500">Cepat</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <CheckCircle2 className="text-primary mb-2" size={24} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tighter text-gray-500">Berkualitas</span>
              </div>
            </div>
          </div>

          {/* Right: Product Info & Landing Section */}
          <div className="flex flex-col">
            {/* Hook text */}
            {product.hook && (
              <p className="text-primary font-bold text-lg sm:text-xl mb-2 tracking-tight">
                {product.hook}
              </p>
            )}
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              {product.title}
            </h1>

            <div className="mb-8 p-6 rounded-3xl bg-secondary/50 border border-gray-100">
              <div className="text-sm text-gray-500 font-medium mb-1">{product.discount_price ? 'Harga Diskon' : 'Harga Special'}</div>
              {product.discount_price ? (
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-black text-primary">
                    {formatPrice(product.discount_price)}
                  </div>
                  <div className="text-lg text-gray-400 line-through font-medium">
                    {formatPrice(product.price || '0')}
                  </div>
                </div>
              ) : (
                <div className="text-4xl font-black text-gray-900">
                  {formatPrice(product.price || '0')}
                </div>
              )}
              <p className="text-sm text-green-600 font-bold mt-2 flex items-center gap-1">
                <CheckCircle2 size={16} />
                <span>Stok Tersedia | 1000+ Terjual</span>
              </p>
            </div>

            {/* Problem Statement */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kenapa Anda Membutuhkannya?</h3>
              <div className="prose prose-sm text-gray-600 leading-relaxed">
                {product.description || 'Produk ini dirancang untuk memberikan solusi terbaik bagi kebutuhan Anda. Dengan kualitas unggulan dan fitur modern, pastikan Anda tidak melewatkan kesempatan ini.'}
              </div>
            </div>

            {/* Benefits List */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Keunggulan Utama</h3>
              <ul className="space-y-3">
                {[
                  "Kualitas Bahan Premium",
                  "Desain Modern & Ergonomis",
                  "Garansi Kepuasan Pelanggan",
                  "Solusi Efisien & Praktis"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Component */}
            <ProductCTA 
              productId={product.id} 
              affiliateUrl={product.affiliate_url} 
              title="Dapatkan Sekarang"
              sticky={true}
            />
            
            <p className="mt-4 text-center text-xs text-gray-400 font-medium">
              *Klik akan diarahkan ke toko resmi untuk penyelesaian transaksi
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
