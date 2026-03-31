import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { CheckCircle2, ShieldCheck, Truck, ArrowLeft, ArrowRight, MousePointer2 } from 'lucide-react'
import ProductCTA from '@/components/ProductCTA'
import ProductGallery from '@/components/ProductGallery'
import HookView from '@/components/HookView'
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
  const baseUrl = 'http://rekomendasi-luma.my.id'

  // Try fetching Hook first
  const { data: hook } = await supabase
    .from('hooks')
    .select('title, description, hook_images(image_url)')
    .eq('slug', slug)
    .single()

  if (hook) {
    const ogImage = hook.hook_images?.[0]?.image_url || '/logo.png'
    return {
      title: hook.title,
      description: hook.description || `Mau racun shopee viral? Cek koleksi ${hook.title} terbaru di sini. Spill produk shopee haul terpercaya dengan link pembelian asli.`,
      keywords: [
        hook.title, "rekomendasi shopee", "shopee haul", "racun shopee", 
        "rekomendasi produk shopee", "spill produk shopee", "リンク shopee", 
        "shopee check", "shopee video viral", "racun shoppe"
      ],
      openGraph: {
        title: hook.title,
        description: hook.description || '',
        url: `${baseUrl}/${slug}`,
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: hook.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: hook.title,
        description: hook.description || '',
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      },
    }
  }

  // Then Product
  const { data: product } = await supabase
    .from('products')
    .select('title, description, image, price, discount_price')
    .eq('slug', slug)
    .single()

  if (product) {
    const ogImage = product.image || '/logo.png'
    return {
      title: product.title,
      description: product.description || `Dapatkan ${product.title} harga termurah! Lihat racun shopee, spill produk, dan link shopee haul viral hanya di Lumahive.`,
      keywords: [
        product.title, "rekomendasi shopee", "racun shopee", "shopee haul", 
        "spill produk", "shopee check", "link shopee video"
      ],
      openGraph: {
        title: product.title,
        description: product.description || '',
        url: `${baseUrl}/${slug}`,
        type: 'article',
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description: product.description || '',
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      },
      other: {
        "twitter:label1": "Harga",
        "twitter:data1": formatPrice(product.discount_price || product.price),
        "twitter:label2": "Ketersediaan",
        "twitter:data2": "Stok Tersedia",
      },
    }
  }

  return { title: 'Tidak Ditemukan' }
}

export default async function SlugCatchAllPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Try Hook
  const { data: hook } = await supabase
    .from('hooks')
    .select(`
      *, 
      hook_images(*), 
      hook_popups(*),
      hook_products(
        position,
        show_in_popup,
        products(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (hook) {
    const sortedProducts = hook.hook_products
      ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((hp: any) => hp.products)
      .filter(Boolean) || []

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": hook.title,
      "description": hook.description || `Daftar produk ${hook.title} terbaik yang sedang viral di Shopee.`,
      "url": `http://rekomendasi-luma.my.id/${slug}`,
      "numberOfItems": sortedProducts.length,
      "itemListElement": sortedProducts.map((p: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": p.title,
          "image": p.image,
          "url": p.affiliate_url,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": p.affiliate_url
          },
          "offers": {
            "@type": "Offer",
            "price": p.discount_price || p.price,
            "priceCurrency": "IDR",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }
      }))
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <HookView hook={hook} />
      </>
    )
  }

  // 2. Try Product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (product) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": {
        "@type": "ImageObject",
        "url": product.image,
        "name": product.title,
        "width": "1200",
        "height": "630"
      },
      "description": product.description || `Spill racun shopee ${product.title} termurah dan terupdate. Cek link pembelian di sini.`,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "Lumahive Curated"
      },
      "offers": {
        "@type": "AggregateOffer",
        "url": `http://rekomendasi-luma.my.id/${slug}`,
        "priceCurrency": "IDR",
        "lowPrice": product.discount_price || product.price,
        "highPrice": product.price || product.discount_price,
        "offerCount": "1",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "Lumahive Racun Shopee"
        }
      }
    }

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "http://rekomendasi-luma.my.id"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": product.title,
          "item": `http://rekomendasi-luma.my.id/${slug}`
        }
      ]
    }

    return (
      <div className="bg-white pb-24 sm:pb-12 text-gray-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <div className="sm:hidden px-4 pt-4">
          <Link href="/" className="inline-flex items-center gap-1 text-gray-500 font-medium">
            <ArrowLeft size={18} />
            <span>Kembali</span>
          </Link>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-6">
              <ProductGallery 
                images={product.images} 
                fallbackImage={product.image} 
                title={product.title} 
                badge={product.badge} 
              />
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

            <div className="flex flex-col">
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
              <div className="mb-10">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kenapa Anda Membutuhkannya?</h3>
                <div className="prose prose-sm text-gray-600 leading-relaxed">
                  {product.description || 'Produk ini dirancang untuk memberikan solusi terbaik bagi kebutuhan Anda.'}
                </div>
              </div>
              <ProductCTA 
                productId={product.id} 
                affiliateUrl={product.affiliate_url} 
                title="Dapatkan Sekarang"
                sticky={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  notFound()
}
