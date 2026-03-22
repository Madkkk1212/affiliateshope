'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, ArrowUpRight, ExternalLink } from 'lucide-react'
import { Product } from '@/types/database'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const handleTrackClick = (e: React.MouseEvent) => {
    // Gunakan keepalive agar request tetap berjalan meskipun navigasi dimulai
    fetch('/api/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id }),
      keepalive: true
    })
    .catch(err => console.error('Failed to track click:', err))
  }

  return (
    <a 
      href={product.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleTrackClick}
      className="group bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100 hover:border-primary/20 hover:shadow-premium transition-all duration-500 flex flex-col h-full cursor-pointer no-underline animate-fade-in"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <ShoppingCart size={48} strokeWidth={1} />
          </div>
        )}
        
        {product.badge && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full shadow-lg shadow-primary/20 z-10 uppercase tracking-widest">
            {product.badge}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md text-gray-900 px-6 py-2.5 rounded-2xl text-xs font-black shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            Lihat Produk
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg">
              {product.category || 'Pilihan'}
            </span>
          </div>
          <h3 className="text-gray-900 font-bold leading-snug line-clamp-2 mt-1 min-h-[3rem] group-hover:text-primary transition-colors text-base sm:text-lg">
            {product.title}
          </h3>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
          <div className="flex flex-col">
            {product.discount_price ? (
              <>
                <div className="text-xs text-gray-400 line-through font-bold mb-0.5 opacity-60">
                  {formatPrice(product.price || '0')}
                </div>
                <div className="text-xl font-black text-primary tracking-tight">
                  {formatPrice(product.discount_price)}
                </div>
              </>
            ) : (
              <div className="text-xl font-black text-gray-900 tracking-tight">
                {formatPrice(product.price || '0')}
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30">
            <ArrowUpRight size={22} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </a>
  )
}
