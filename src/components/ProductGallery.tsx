'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'

interface ProductGalleryProps {
  images: string[] | null
  fallbackImage: string | null
  title: string
  badge: string | null
}

export default function ProductGallery({ images, fallbackImage, title, badge }: ProductGalleryProps) {
  // Use images array if it exists and has items, otherwise fallback to the single image or empty
  const gallery = images && images.length > 0 ? images : (fallbackImage ? [fallbackImage] : [])
  const [activeIndex, setActiveIndex] = useState(0)

  if (gallery.length === 0) {
    return (
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-premium bg-gray-50 flex items-center justify-center text-gray-200">
        <ShieldCheck size={120} strokeWidth={1} />
        {badge && (
          <div className="absolute top-6 left-6 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg">
            {badge}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-premium bg-gray-50">
        <Image
          src={gallery[activeIndex]}
          alt={title}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {badge && (
          <div className="absolute top-6 left-6 px-4 py-2 bg-primary text-white text-sm font-bold rounded-full shadow-lg z-10">
            {badge}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar snap-x">
          {gallery.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 border-2 transition-all p-0 snap-start ${
                activeIndex === idx 
                  ? 'border-primary ring-2 ring-primary/20 bg-orange-50' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
