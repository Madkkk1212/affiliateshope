'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
  const [isPopupOpen, setIsPopupOpen] = useState(false)
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

  const handleClose = useCallback(() => {
    setIsPopupOpen(false)
  }, [])

  const handleShow = useCallback(() => {
    setIsPopupOpen(true)
  }, [])

  // Curated images for the landing popup
  const popupImages = useMemo(() => {
    return sortedProducts
      ?.filter((p: any) => p.show_in_popup)
      ?.map((p: any) => ({ image_url: p.image }))
      ?.filter((img: any) => img.image_url) || []
  }, [sortedProducts])

  const popupConfig = useMemo(() => {
    const userPopup = hook.hook_popups?.[0] || {}
    return {
      id: userPopup.id || hook.id,
      show_once: userPopup.show_once !== undefined ? userPopup.show_once : true,
      is_active: userPopup.is_active !== undefined ? userPopup.is_active : true,
      trigger_type: userPopup.trigger_type || 'immediate',
      trigger_value: userPopup.trigger_value || 0,
      title: userPopup.title || hook.title,
      description: userPopup.description || hook.description,
      cta_text: userPopup.cta_text || 'Lihat Produk Rekomendasi',
      popup_images: popupImages.length > 0 ? popupImages : (hook.hook_images?.map((img: any) => ({ image_url: img.image_url })) || []),
      auto_close: hook.visual_config?.popup_settings?.auto_close || false,
      auto_close_time: hook.visual_config?.popup_settings?.auto_close_time || 5
    }
  }, [hook, popupImages])

  return (
    <div 
      className="relative min-h-screen transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: settings.pageBg || '#f9fafb', padding: '0px' }}
    >
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-10 mix-blend-multiply overflow-hidden">
        <img 
          src="/logo.png" 
          alt="Luma Hive Watermark" 
          className="w-[120%] sm:w-[80%] max-w-[1000px] object-contain rotate-[-5deg] grayscale"
        />
      </div>
      {/* The Landing Popup (Hook Info as Popup with Product Collage) */}
      <HookPopup 
        popup={popupConfig} 
        onShow={handleShow}
        onClose={handleClose}
        onCTA={handleClose}
      />

      {/* Main Content (Blurred when popup is open) */}
      <div className={`transition-all duration-1000 ease-out min-h-screen ${isPopupOpen ? 'blur-[40px] scale-105 opacity-40 select-none pointer-events-none' : 'blur-0 scale-100 opacity-100'}`}>
        
        {/* Hero Section */}
        <div className="relative pt-16 sm:pt-28 pb-12 sm:pb-20 px-4 mb-4 sm:mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-transparent -z-10" />
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-gray-200/60 text-gray-700 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                <Star size={12} className="text-orange-400 fill-orange-400" /> Premium Curated
              </div>
              <div className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-md">
                <CheckCircle2 size={12} className="text-green-400" /> Verified 
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-md border border-gray-200/60 text-gray-500 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm">
                {sortedProducts.length} Items
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-6 sm:mb-8 drop-shadow-sm px-2">
              {hook.title}
            </h1>
            
            <p className="text-sm sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium px-4">
              {hook.description || 'Koleksi eksklusif pilihan terbaik yang dikurasi khusus untuk memenuhi preferensi gaya dan standar premium Anda.'}
            </p>
          </div>
        </div>

        {/* Desktop Layout (sm and up) */}
        <div className="hidden sm:block container mx-auto px-4 pb-24">
          {hasVisualLayout ? (
            <div ref={containerRef} className="max-w-7xl mx-auto p-0 overflow-visible relative z-10">
              <Responsive
                className="layout"
                width={width}
                layouts={normalizedLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={width < 640 ? 45 : 60}
                margin={[
                  width < 640 ? Math.max(settings.gap || 16, 16) : (settings.gap || 24), 
                  width < 640 ? Math.max(settings.gap || 16, 16) : (settings.gap || 24)
                ]}
              >
                {sortedProducts.map((product: any) => {
                  const cardStyle = overrides[product.id] || {}
                  return (
                    <div 
                      key={product.id} 
                      className="group overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200"
                      style={{
                        borderRadius: `${settings.borderRadius || 24}px`,
                        boxShadow: settings.shadow ? '0 10px 40px -10px rgba(0,0,0,0.08)' : '0 4px 20px -5px rgba(0,0,0,0.05)',
                        backgroundColor: settings.cardBg || '#ffffff',
                        border: '1px solid rgba(255,255,255,0.7)'
                      }}
                    >
                      <Link href={product.affiliate_url} target="_blank" className="flex-grow overflow-hidden relative block group-hover:opacity-95 transition-opacity">
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </Link>
                      <div className="p-5 flex flex-col gap-1_5 bg-white relative z-10">
                        <h3 
                          className="font-extrabold text-gray-900 leading-snug line-clamp-2 tracking-tight group-hover:text-primary transition-colors duration-300"
                          style={{ fontSize: `${settings.fontSize || 16}px` }}
                        >
                          {cardStyle.title || product.title}
                        </h3>
                        <div className="text-gray-900 font-black text-xl mt-1 tracking-tight">
                          {formatPrice(product.discount_price || product.price)}
                        </div>
                        <Link 
                           href={product.affiliate_url} 
                           target="_blank"
                           className="mt-4 py-3 text-center text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 block relative overflow-hidden group/btn"
                           style={{ backgroundColor: cardStyle.buttonColor || settings.buttonColor || '#111827' }}
                        >
                          <span className="relative z-10">{cardStyle.buttonText || settings.buttonText || 'Lihat Detail'}</span>
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </Responsive>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {sortedProducts.map((product: any, idx: number) => {
                  const cardStyle = overrides[product.id] || {}
                  return (
                    <div 
                      key={product.id} 
                      className="bg-white overflow-hidden border border-gray-100 flex flex-col gap-0 p-3 sm:p-4 transition-all duration-500 hover:-translate-y-2 group"
                      style={{
                        borderRadius: `${settings.borderRadius || 28}px`,
                        boxShadow: settings.shadow ? '0 20px 40px -10px rgba(0,0,0,0.06)' : '0 10px 30px -10px rgba(0,0,0,0.04)',
                        backgroundColor: settings.cardBg || '#ffffff'
                      }}
                    >
                      {/* Product Image */}
                      <Link href={product.affiliate_url} target="_blank" className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 relative block">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={48} />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 border border-white shadow-sm flex items-center gap-1.5">
                          <Star size={10} className="fill-orange-400 text-orange-400" />
                          Top #{idx + 1}
                        </div>
                      </Link>

                      {/* Product Info */}
                      <div className="flex-grow flex flex-col justify-between pt-5 px-3 pb-2">
                        <div>
                          <h3 
                            className="font-extrabold text-gray-900 leading-snug mb-3 line-clamp-2 tracking-tight group-hover:text-primary transition-colors duration-300"
                            style={{ fontSize: `${settings.fontSize || 18}px` }}
                          >
                            {cardStyle.title || product.title}
                          </h3>
                          
                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-2xl font-black text-gray-900 tracking-tight">
                              {formatPrice(product.discount_price || product.price)}
                            </span>
                          </div>
                        </div>

                        <Link 
                          href={product.affiliate_url} 
                          target="_blank"
                          className="w-full py-4 flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-white font-black overflow-hidden relative group/btn"
                          style={{ backgroundColor: cardStyle.buttonColor || settings.buttonColor || '#111827' }}
                        >
                          <span className="relative z-10 tracking-wide uppercase text-[11px] sm:text-xs">{cardStyle.buttonText || settings.buttonText || 'Beli Sekarang'}</span>
                          <ExternalLink size={16} className="relative z-10" />
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dedicated Mobile Layout (Strict 2-Column Grid) (< sm) */}
        <div className="block sm:hidden px-3 pb-20 relative z-10">
          <div className="grid grid-cols-2 gap-2.5">
            {sortedProducts.map((product: any, idx: number) => {
              const cardStyle = overrides[product.id] || {}
              return (
                <div 
                  key={product.id} 
                  className="bg-white overflow-hidden flex flex-col group relative"
                  style={{
                    borderRadius: `${Math.min(settings.borderRadius || 24, 20)}px`,
                    boxShadow: settings.shadow ? '0 10px 25px -5px rgba(0,0,0,0.05)' : '0 2px 10px -2px rgba(0,0,0,0.03)',
                    backgroundColor: settings.cardBg || '#ffffff',
                    border: '1px solid rgba(200,200,200,0.1)'
                  }}
                >
                  <Link href={product.affiliate_url} target="_blank" className="w-full aspect-[4/5] overflow-hidden bg-gray-50 flex-shrink-0 relative block">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                    {/* Top Center Badge (Like Screenshot) */}
                    <div className="absolute top-0 inset-x-0 flex justify-center">
                      <div className="bg-white px-3 py-1 rounded-b-xl shadow-sm text-[9px] font-black uppercase tracking-widest text-[#ff4d00]" style={{ color: cardStyle.buttonColor || settings.buttonColor || '#ff4d00' }}>
                        BEST SELLER
                      </div>
                    </div>
                  </Link>

                  <div className="flex-grow flex flex-col justify-between p-3">
                    <div>
                      <h3 
                        className="font-bold text-gray-900 leading-tight mb-1.5 line-clamp-2 tracking-tight"
                        style={{ fontSize: `${Math.min(settings.fontSize || 14, 14)}px` }}
                      >
                        {cardStyle.title || product.title}
                      </h3>
                      
                      <div className="flex flex-col mb-3">
                        <span className="font-black text-[#ff4d00] tracking-tight text-sm leading-none" style={{ color: cardStyle.buttonColor || settings.buttonColor || '#ff4d00' }}>
                          {formatPrice(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && (
                           <span className="text-[10px] text-gray-400 font-bold line-through mt-0.5">
                             {formatPrice(product.price)}
                           </span>
                        )}
                      </div>
                    </div>

                    <Link 
                      href={product.affiliate_url} 
                      target="_blank"
                      className="w-full py-2.5 flex items-center justify-center rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 text-white font-black"
                      style={{ backgroundColor: cardStyle.buttonColor || settings.buttonColor || '#2563eb' }}
                    >
                      <span className="tracking-widest uppercase text-[10px]">{cardStyle.buttonText || settings.buttonText || 'LIHAT DETAIL'}</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
