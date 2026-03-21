'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Responsive, Layout } from 'react-grid-layout'
import toast, { Toaster } from 'react-hot-toast'

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
import { 
  Laptop, Tablet, Smartphone, Eye, Settings, 
  Trash2, Maximize2, Type, Palette, LayoutGrid, 
  Layers, CornerUpLeft, Plus, Save, Square, X
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

// Import grid layout styles
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// No HOC needed, handled locally

interface VisualHookBuilderProps {
  products: any[]
  initialConfig?: any
  onSave: (config: any) => void
}

export default function VisualHookBuilder({ products, initialConfig, onSave }: VisualHookBuilderProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [selectedId, setSelectedId] = useState<string | null>(null)
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

  // Layout and Style State
  const [layouts, setLayouts] = useState<any>(initialConfig?.layouts || { lg: initialConfig?.layout || [] })
  const [config, setConfig] = useState({
    columns: initialConfig?.settings?.columns || 3,
    gap: initialConfig?.settings?.gap || 20,
    borderRadius: initialConfig?.settings?.borderRadius || 24,
    fontSize: initialConfig?.settings?.fontSize || 16,
    shadow: initialConfig?.settings?.shadow ?? true,
    buttonColor: initialConfig?.settings?.buttonColor || '#2563eb',
    buttonText: initialConfig?.settings?.buttonText || 'Lihat Detail',
    cardBg: initialConfig?.settings?.cardBg || '#ffffff',
    pageBg: initialConfig?.settings?.pageBg || '#f9fafb',
    ...initialConfig?.settings
  })

  // Per-card overrides
  const [overrides, setOverrides] = useState<Record<string, any>>(initialConfig?.overrides || {})

  useEffect(() => {
    if (products.length === 0) return
    
    // Check current active breakpoint layout
    const currentBreakpoint = device === 'mobile' ? 'xs' : device === 'tablet' ? 'md' : 'lg'
    const currentLayout = layouts[currentBreakpoint] || layouts.lg || []
    
    const existingIds = new Set((currentLayout as any[]).map(l => l.i))
    const missingProducts = products.filter(p => !existingIds.has(p.id))
    
    if (missingProducts.length > 0) {
      const maxY = Math.max(0, ...(currentLayout as any[]).map(l => l.y + l.h))
      const colLimit = device === 'mobile' ? 4 : device === 'tablet' ? 10 : 12
      const userCols = config.columns || 3
      const colWidth = Math.floor(colLimit / userCols)

      const newItems = missingProducts.map((p, idx) => ({
        i: p.id,
        x: (idx % userCols) * colWidth,
        y: maxY + Math.floor(idx / userCols) * 5,
        w: colWidth,
        h: 5
      }))
      
      setLayouts((prev: any) => ({
        ...prev,
        [currentBreakpoint]: [...(prev[currentBreakpoint] || []), ...newItems]
      }))
    }
  }, [products, device])

  const resetLayout = (cols: number) => {
    const colLimit = device === 'mobile' ? 4 : device === 'tablet' ? 10 : 12
    const currentBreakpoint = device === 'mobile' ? 'xs' : device === 'tablet' ? 'md' : 'lg'
    const colWidth = Math.floor(colLimit / cols)
    
    const newItems = products.map((p, i) => ({
      i: p.id,
      x: (i % cols) * colWidth,
      y: Math.floor(i / cols) * 5,
      w: colWidth,
      h: 5
    }))
    
    setLayouts((prev: any) => ({
      ...prev,
      [currentBreakpoint]: newItems
    }))
    toast.success(`Layout ${device} disusun ulang ke ${cols} kolom!`)
  }

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts)
  }

  const updateCardOverride = (id: string, key: string, value: any) => {
    setOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }))
  }

  const handleSave = () => {
    onSave({
      layouts,
      settings: config,
      overrides
    })
  }

  const getDeviceWidth = () => {
    if (device === 'mobile') return 'max-w-[375px]'
    if (device === 'tablet') return 'max-w-[768px]'
    return 'max-w-full'
  }

  const selectedCard = products.find(p => p.id === selectedId)

  return (
    <div className="flex flex-col h-[800px] bg-gray-100 rounded-3xl overflow-hidden border border-gray-200">
      <Toaster />
      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setViewMode('edit')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'edit' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={16} />
            <span>Edit Mode</span>
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'preview' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
          <button onClick={() => setDevice('desktop')} className={`p-2 rounded-lg transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}><Laptop size={18} /></button>
          <button onClick={() => setDevice('tablet')} className={`p-2 rounded-lg transition-all ${device === 'tablet' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}><Tablet size={18} /></button>
          <button onClick={() => setDevice('mobile')} className={`p-2 rounded-lg transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'}`}><Smartphone size={18} /></button>
        </div>

        <button 
          onClick={handleSave}
          className="btn-primary py-2 px-6 rounded-xl flex items-center gap-2"
        >
          <Save size={16} />
          <span>Update Visual</span>
        </button>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-grow overflow-y-auto p-12 bg-gray-100 custom-scrollbar flex justify-center">
          <div 
            ref={containerRef}
            className={`${getDeviceWidth()} w-full bg-white min-h-[1000px] shadow-2xl rounded-[2.5rem] p-0 transition-all duration-500 relative ${viewMode === 'edit' ? 'grid-background' : ''}`}
            style={{ backgroundColor: config.pageBg }}
          >
            <Responsive as أي {...({
              className: "layout",
              width: width,
              layouts: layouts,
              breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
              cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
              rowHeight: device === 'mobile' ? 45 : 60,
              onLayoutChange: handleLayoutChange,
              isDraggable: viewMode === 'edit',
              isResizable: viewMode === 'edit',
              margin: [config.gap, config.gap],
              compactType: null,
              preventCollision: false
            } as any)}
            >
              {products.map(product => {
                const cardStyle = overrides[product.id] || {}
                return (
                  <div 
                    key={product.id} 
                    onClick={() => viewMode === 'edit' && setSelectedId(product.id)}
                    className={`bg-white group cursor-pointer border hover:border-primary transition-all duration-300 relative overflow-hidden flex flex-col`}
                    style={{
                      borderRadius: `${config.borderRadius}px`,
                      boxShadow: config.shadow ? '0 10px 30px -5px rgba(0,0,0,0.1)' : 'none',
                      backgroundColor: config.cardBg,
                      border: selectedId === product.id ? '2px solid #2563eb' : '1px solid #f1f5f9'
                    }}
                  >
                    {/* Visual Card Content */}
                    <div className="flex-grow overflow-hidden relative">
                      <img 
                        src={product.image} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary">
                        Best Seller
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-1">
                      <h3 
                        className="font-bold text-gray-900 leading-tight line-clamp-2"
                        style={{ fontSize: `${config.fontSize}px` }}
                      >
                        {cardStyle.title || product.title}
                      </h3>
                      <div className="text-primary font-black text-lg">
                        {formatPrice(product.discount_price || product.price)}
                      </div>
                      <div 
                        className="mt-2 py-2 text-center text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20"
                        style={{ backgroundColor: cardStyle.buttonColor || config.buttonColor }}
                      >
                        {cardStyle.buttonText || config.buttonText}
                      </div>
                    </div>

                    {/* Resize Handle Overlay (Edit Mode) */}
                    {viewMode === 'edit' && (
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                         <div className="bg-white/90 p-2 rounded-lg shadow-sm border border-gray-200 flex gap-2">
                           <Maximize2 size={12} className="text-gray-400" />
                         </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </Responsive>
          </div>
        </div>

        {/* Settings Sidebar */}
        {viewMode === 'edit' && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-6 custom-scrollbar shrink-0">
            {selectedId ? (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Layers size={18} className="text-primary" />
                    <span>Card Settings</span>
                  </h3>
                  <button onClick={() => setSelectedId(null)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18}/></button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Type size={12}/> Custom Title</label>
                    <input 
                      type="text" 
                      value={overrides[selectedId]?.title || ''}
                      placeholder={selectedCard?.title}
                      onChange={(e) => updateCardOverride(selectedId, 'title', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Type size={12}/> Button Text</label>
                    <input 
                      type="text" 
                      value={overrides[selectedId]?.buttonText || ''}
                      placeholder={config.buttonText}
                      onChange={(e) => updateCardOverride(selectedId, 'buttonText', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Palette size={12}/> CTA Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={overrides[selectedId]?.buttonColor || config.buttonColor}
                        onChange={(e) => updateCardOverride(selectedId, 'buttonColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border-0 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={overrides[selectedId]?.buttonColor || config.buttonColor}
                        onChange={(e) => updateCardOverride(selectedId, 'buttonColor', e.target.value)}
                        className="flex-grow px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                        const newOverrides = { ...overrides }
                        delete newOverrides[selectedId]
                        setOverrides(newOverrides)
                    }}
                    className="w-full py-3 rounded-xl border border-red-100 text-red-500 text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <CornerUpLeft size={14} />
                    <span>Reset per Card Settings</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                       <LayoutGrid size={18} className="text-primary" />
                       <span>Global Layout</span>
                    </h3>
                    <button 
                      onClick={() => resetLayout(config.columns)}
                      className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-all flex items-center gap-1 text-[10px] font-black uppercase"
                      title={`Reset ${device} ke grid rapi`}
                    >
                      <CornerUpLeft size={14} />
                      <span>Fix {device === 'mobile' ? 'Mobile' : 'Grid'}</span>
                    </button>
                  </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>{device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : 'Desktop'} Columns</span>
                      <span className="text-primary">{config.columns}</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max={device === 'mobile' ? 4 : 5} 
                      value={config.columns}
                      onChange={(e) => {
                        const newCols = parseInt(e.target.value)
                        setConfig((prev: any) => ({ ...prev, columns: newCols }))
                        // Automatically offer reset if it's a big change? Or just reset.
                        // For better UX, let's just reset if they are clicking the dots
                        resetLayout(newCols)
                      }}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Grid Gap</span>
                      <span className="text-primary">{config.gap}px</span>
                    </label>
                    <input 
                      type="range" min="0" max="40" 
                      value={config.gap}
                      onChange={(e) => setConfig((prev: any) => ({ ...prev, gap: parseInt(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Card Radius</span>
                      <span className="text-primary">{config.borderRadius}px</span>
                    </label>
                    <input 
                      type="range" min="0" max="50" 
                      value={config.borderRadius}
                      onChange={(e) => setConfig((prev: any) => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                      <span>Card Font Size</span>
                      <span className="text-primary">{config.fontSize}px</span>
                    </label>
                    <input 
                      type="range" min="12" max="24" 
                      value={config.fontSize}
                      onChange={(e) => setConfig((prev: any) => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Type size={12}/> Global Button Text</label>
                    <input 
                      type="text" 
                      value={config.buttonText}
                      onChange={(e) => setConfig((prev: any) => ({ ...prev, buttonText: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary text-sm outline-none"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><Palette size={12}/> Page Background</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={config.pageBg}
                        onChange={(e) => setConfig((prev: any) => ({ ...prev, pageBg: e.target.value }))}
                        className="w-10 h-10 rounded-lg border-0 bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={config.pageBg}
                        onChange={(e) => setConfig((prev: any) => ({ ...prev, pageBg: e.target.value }))}
                        className="flex-grow px-4 py-2 rounded-xl border border-gray-100 bg-gray-50 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">Premium Shadow</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={config.shadow}
                      onChange={(e) => setConfig((prev: any) => ({ ...prev, shadow: e.target.checked }))}
                      className="w-5 h-5 accent-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .grid-background {
          background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .react-grid-item.react-grid-placeholder {
          background: rgba(37, 99, 235, 0.1) !important;
          border-radius: 24px !important;
          opacity: 0.5 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  )
}
