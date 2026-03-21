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
      className="group bg-white rounded-2xl overflow-hidden shadow-premium border border-gray-100 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 flex flex-col h-full cursor-pointer no-underline"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} strokeWidth={1} />
          </div>
        )}
        
        {product.badge && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full shadow-sm z-10 uppercase tracking-tighter">
            {product.badge}
          </div>
        )}

        {/* Pro Badge: Klik untuk beli */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Klik untuk beli
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs font-medium text-primary uppercase tracking-wider">
            {product.category || 'Rekomendasi'}
          </span>
          <h3 className="text-gray-900 font-bold leading-tight line-clamp-2 mt-1 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount_price ? (
              <>
                <div className="text-xs text-gray-400 line-through font-medium">
                  {formatPrice(product.price || '0')}
                </div>
                <div className="text-lg font-bold text-primary">
                  {formatPrice(product.discount_price)}
                </div>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(product.price || '0')}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-12">
            <ArrowUpRight size={20} />
          </div>
        </div>
      </div>
    </a>
  )
}
