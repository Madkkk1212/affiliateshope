'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ShoppingBag, Star, ExternalLink, CheckCircle2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import HookPopup from '@/components/HookPopup'
import Link from 'next/link'
import { Responsive } from 'react-grid-layout'

function WidthProvider(ComposedComponent: any) {
  return function Wrapped(props: any) {
    const [width, setWidth] = useState(1200)
    const [mounted, setMounted] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
      setMounted(true)
      if (!ref.current) return
      
      const observer = new ResizeObserver(entries => {
        if (entries[0]) setWidth(entries[0].contentRect.width)
      })
      observer.observe(ref.current)
      return () => observer.disconnect()
    }, [])

    if (!mounted) return null

    return (
      <div ref={ref} className="w-full">
        <ComposedComponent {...props} width={width} />
      </div>
    )
  }
}

// Import grid layout styles
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// No HOC needed, we handle width locally

interface HookViewProps {
  hook: any
}

export default function HookView({ hook }: HookViewProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(true)
  const [width, setWidth] = useState(1200)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      if (entries[0]) setWidth(entries[0].contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { visual_config } = hook
  const hasVisualLayout = visual_config?.layouts || (visual_config?.layout && visual_config.layout.length > 0)
  const settings = visual_config?.settings || {}
  const overrides = visual_config?.overrides || {}

  const sortedProducts = useMemo(() => {
    return hook.hook_products
      ?.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .map((hp: any) => ({
        ...hp.products,
        show_in_popup: hp.show_in_popup
      }))
      .filter(Boolean) || []
  }, [hook.hook_products])

  const normalizedLayouts = useMemo(() => {
    if (!hasVisualLayout) return {}
    
    const breakpoints = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }
    const result: any = {}
    
    Object.entries(breakpoints).forEach(([bp, cols]) => {
      const baseLayout = (visual_config.layouts?.[bp] || visual_config.layouts?.lg || visual_config.layout || []).map((l: any) => ({ ...l, static: true }))
      const existingIds = new Set(baseLayout.map((l: any) => l.i))
      const missingProducts = sortedProducts.filter((p: any) => !existingIds.has(p.id))
      
      const maxY = Math.max(0, ...baseLayout.map((l: any) => (l.y || 0) + (l.h || 0)))
      const currentCols = settings.columns || 3
      const colWidth = Math.floor(cols / currentCols) || 1
      
      const newItems = missingProducts.map((p: any, idx: number) => ({
        i: p.id,
        x: (idx % currentCols) * colWidth,
        y: maxY + Math.floor(idx / currentCols) * 5,
        w: colWidth,
        h: 5,
        static: true
      }))
      
      result[bp] = [...baseLayout, ...newItems]
    })
    
    return result
  }, [visual_config, sortedProducts, hasVisualLayout, settings.columns])

  const handleClose = () => {
    setIsPopupOpen(false)
  }

  // Curated images for the landing popup
  const popupImages = sortedProducts
    ?.filter((p: any) => p.show_in_popup)
    ?.map((p: any) => ({ image_url: p.image }))
    ?.filter((img: any) => img.image_url) || []

  return (
    <div 
      className="relative min-h-screen transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: settings.pageBg || '#f9fafb', padding: '0px' }}
    >
      {/* The Landing Popup (Hook Info as Popup with Product Collage) */}
      <HookPopup 
        popup={{
          is_active: true,
          trigger_type: 'immediate',
          title: hook.title,
          description: hook.description,
          cta_text: 'Lihat Produk Rekomendasi',
          popup_images: popupImages.length > 0 ? popupImages : (hook.hook_images?.map((img: any) => ({ image_url: img.image_url })) || [])
        }} 
        onClose={handleClose}
        onCTA={handleClose}
      />

      {/* Main Content (Blurred when popup is open) */}
      <div className={`transition-all duration-1000 ease-out min-h-screen ${isPopupOpen ? 'blur-[40px] scale-110 opacity-30 select-none pointer-events-none' : 'blur-0 scale-100 opacity-100'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black">
                {hook.title.charAt(0)}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-black text-gray-900 truncate">{hook.title}</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{sortedProducts.length} Produk Rekomendasi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-0 py-8">
          {hasVisualLayout ? (
            <div ref={containerRef} className="max-w-7xl mx-auto p-0 overflow-visible">
              <Responsive
                className="layout"
                width={width}
                layouts={normalizedLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={width < 640 ? 45 : 60}
                margin={[
                  width < 640 ? Math.max(settings.gap || 16, 16) : (settings.gap || 20), 
                  width < 640 ? Math.max(settings.gap || 16, 16) : (settings.gap || 20)
                ]}
              >
                {sortedProducts.map((product: any) => {
                  const cardStyle = overrides[product.id] || {}
                  return (
                    <div 
                      key={product.id} 
                      className="bg-white group overflow-hidden flex flex-col transition-all duration-300"
                      style={{
                        borderRadius: `${settings.borderRadius || 24}px`,
                        boxShadow: settings.shadow ? '0 10px 30px -5px rgba(0,0,0,0.1)' : 'none',
                        backgroundColor: settings.cardBg || '#ffffff',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <Link href={product.affiliate_url} target="_blank" className="flex-grow overflow-hidden relative block">
                        <img 
                          src={product.image} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </Link>
                      <div className="p-4 flex flex-col gap-1">
                        <h3 
                          className="font-bold text-gray-900 leading-tight line-clamp-2"
                          style={{ fontSize: `${settings.fontSize || 16}px` }}
                        >
                          {cardStyle.title || product.title}
                        </h3>
                        <div className="text-primary font-black text-lg">
                          {formatPrice(product.discount_price || product.price)}
                        </div>
                        <Link 
                           href={product.affiliate_url} 
                           target="_blank"
                           className="mt-2 py-2 text-center text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 block"
                           style={{ backgroundColor: cardStyle.buttonColor || settings.buttonColor || '#2563eb' }}
                        >
                          {cardStyle.buttonText || settings.buttonText || 'Lihat Detail'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </Responsive>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                {sortedProducts.map((product: any, idx: number) => {
                  const cardStyle = overrides[product.id] || {}
                  return (
                    <div 
                      key={product.id} 
                      className="bg-white overflow-hidden border border-gray-100 flex flex-col sm:flex-row gap-6 p-6 transition-all duration-300"
                      style={{
                        borderRadius: `${settings.borderRadius || 24}px`,
                        boxShadow: settings.shadow ? '0 10px 30px -5px rgba(0,0,0,0.1)' : 'none',
                        backgroundColor: settings.cardBg || '#ffffff'
                      }}
                    >
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
                          <h3 
                            className="font-bold text-gray-900 leading-tight mb-3 line-clamp-2"
                            style={{ fontSize: `${settings.fontSize || 20}px` }}
                          >
                            {cardStyle.title || product.title}
                          </h3>
                          
                          <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-2xl font-black text-primary">
                              {formatPrice(product.discount_price || product.price)}
                            </span>
                          </div>
                        </div>

                        <Link 
                          href={product.affiliate_url} 
                          target="_blank"
                          className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform text-white font-black"
                          style={{ backgroundColor: cardStyle.buttonColor || settings.buttonColor || '#2563eb' }}
                        >
                          <span>{cardStyle.buttonText || settings.buttonText || 'Beli di Shopee'}</span>
                          <ExternalLink size={18} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
