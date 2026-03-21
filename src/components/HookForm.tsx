'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, Plus, X, GripVertical, Image as ImageIcon, Send, Clock, MousePointer2, MoveDown, Maximize2, Settings } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { saveHook } from '@/app/actions/hook'
import ProductPicker from './ProductPicker'
import VisualHookBuilder from './VisualHookBuilder'
import { slugify } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface HookFormProps {
  initialData?: any
  categories: any[]
}

export default function HookForm({ initialData, categories }: HookFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    status: initialData?.status || 'draft',
    products: initialData?.hook_products?.map((p: any) => ({ id: p.product_id, show_in_popup: !!p.show_in_popup })) || [],
      images: initialData?.hook_images?.map((img: any) => img.image_url) || [],
      visual_config: initialData?.visual_config || {},
      popup: initialData?.hook_popups?.[0] || {
        is_active: true,
        title: '',
        description: '',
        cta_text: 'Lihat Detail',
        trigger_type: 'delay',
        trigger_value: 5,
        images: initialData?.hook_popups?.[0]?.popup_images?.map((img: any) => img.image_url) || []
      }
    })
  
    const [showVisualBuilder, setShowVisualBuilder] = useState(false)
    const [selectedProductsData, setSelectedProductsData] = useState<any[]>([])

  // Fetch product data when IDs change
  useEffect(() => {
    const fetchProducts = async () => {
      if (formData.products.length === 0) {
        setSelectedProductsData([])
        return
      }
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', formData.products.map((p: any) => p.id))
      
      // Keep sort order same as formData.products
      const sorted = formData.products.map((p: any) => data?.find(d => d.id === p.id)).filter(Boolean)
      setSelectedProductsData(sorted)
    }
    fetchProducts()
  }, [formData.products])

  // Auto-slug
  useEffect(() => {
    if (!initialData && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [formData.title, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations
    if (!formData.category) return toast.error('Pilih kategori wajib!')
    if (formData.status === 'publish' && formData.products.length === 0) {
      return toast.error('Tidak boleh publish jika produk kosong!')
    }
    // Relaxed limit per user's request
    /* if (formData.products.length > 20) {
      return toast.error('Maksimal 20 produk per hook!')
    } */

    setLoading(true)
    try {
      const res = await saveHook(formData, initialData?.id)
      if (res.success) {
        toast.success('Hook berhasil disimpan!')
        const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
        const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'
        router.push(`/${adminSecret}/${hooksSecret}`)
        router.refresh()
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSelect = (productId: string) => {
    // Limits removed as per user request
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { id: productId, show_in_popup: false }]
    }))
  }

  const handleProductRemove = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((p: any) => p.id !== productId)
    }))
  }

  const toggleProductInPopup = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((p: any) => 
        p.id === productId ? { ...p, show_in_popup: !p.show_in_popup } : p
      )
    }))
  }

  const moveProduct = (index: number, direction: 'up' | 'down') => {
    const newProducts = [...formData.products]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newProducts.length) return
    
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]]
    setFormData(prev => ({ ...prev, products: newProducts }))
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-accent transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Informasi Dasar Hook</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Judul Hook</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Contoh: Rekomendasi Skincare Viral TikTok"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">/</span>
                    <input 
                      type="text" 
                      required 
                      value={formData.slug}
                      onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Deskripsi Singkat</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                    placeholder="Berikan penjelasan singkat yang menarik..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6">Pilih Produk & Urutan</h2>
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                    <span>Cari Produk dari Kategori Terpilih</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                      {formData.products.length} Terpilih
                    </span>
                  </label>
                  <ProductPicker 
                    category={formData.category} // Corrected prop name
                    selectedIds={formData.products.map((p: any) => p.id)}
                    onSelect={handleProductSelect}
                    onRemove={handleProductRemove}
                  />
                </div>

                {formData.products.length > 0 && (
                  <div className="pt-6 border-t border-gray-50">
                    <label className="text-sm font-bold text-gray-700 mb-4 block">Atur Urutan Tampil</label>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {formData.products.map((p: any, idx: number) => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-xs font-bold text-gray-400">
                            {idx + 1}
                          </span>
                          <div className="flex-grow text-sm font-bold text-gray-700 truncate">
                            ID: {p.id}
                          </div>
                          
                          {/* New: Toggle for Popup Imaging */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-gray-100">
                            <input 
                              type="checkbox"
                              id={`popup-${p.id}`}
                              checked={p.show_in_popup}
                              onChange={() => toggleProductInPopup(p.id)}
                              className="w-4 h-4 accent-primary cursor-pointer"
                            />
                            <label htmlFor={`popup-${p.id}`} className="text-[10px] font-black uppercase text-gray-400 cursor-pointer select-none">Tampilkan di Popup</label>
                          </div>

                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => moveProduct(idx, 'up')}
                              disabled={idx === 0}
                              className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 disabled:opacity-30"
                            >
                              <ImageIcon className="rotate-180" size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => moveProduct(idx, 'down')}
                              disabled={idx === formData.products.length - 1}
                              className="p-2 hover:bg-white rounded-lg transition-all text-gray-400 disabled:opacity-30"
                            >
                              <MoveDown size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleProductRemove(p.id)}
                              className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center justify-between">
                <span>Popup Settings</span>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={formData.popup.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, is_active: e.target.checked } }))}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-xs font-bold text-gray-500 uppercase">Aktifkan</span>
                </div>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Judul Popup</label>
                    <input 
                      type="text" 
                      value={formData.popup.title}
                      onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, title: e.target.value } }))}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Isi Pesan</label>
                    <textarea 
                      rows={3}
                      value={formData.popup.description}
                      onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, description: e.target.value } }))}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm resize-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Teks Tombol (CTA)</label>
                    <input 
                      type="text" 
                      value={formData.popup.cta_text}
                      onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, cta_text: e.target.value } }))}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Trigger</label>
                      <select 
                        value={formData.popup.trigger_type}
                        onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, trigger_type: e.target.value } }))}
                        className="w-full px-4 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-sm outline-none"
                      >
                        <option value="click">Klik (Count)</option>
                        <option value="scroll">Scroll (%)</option>
                        <option value="delay">Delay (S)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Value</label>
                      <input 
                        type="number" 
                        value={formData.popup.trigger_value}
                        onChange={e => setFormData(prev => ({ ...prev, popup: { ...prev.popup, trigger_value: parseInt(e.target.value) } }))}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Form */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8 sticky top-24">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Kategori Utama</label>
                  <select 
                    required 
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value, products: [] }))}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 font-bold text-gray-700 outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-normal">PENTING: Produk yang bisa dipilih akan menyesuaikan dengan kategori ini.</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-50">
                  <label className="text-sm font-bold text-gray-700">Tampilan Visual</label>
                  <button 
                    type="button"
                    onClick={() => setShowVisualBuilder(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary text-primary font-bold hover:bg-primary/5 transition-all outline-none"
                  >
                    <Maximize2 size={16} />
                    <span>Buka Visual Editor</span>
                  </button>
                </div>

                <div className="space-y-3 pt-4">
                  <label className="text-sm font-bold text-gray-700">Status Publikasi</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'draft' }))}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        formData.status === 'draft' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      Draft
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'publish' }))}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        formData.status === 'publish' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      Publish
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 shadow-xl shadow-primary/30 mt-6"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{loading ? 'Menyimpan...' : 'Simpan Hook'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Visual Builder Modal Overlay */}
      {showVisualBuilder && (
        <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col">
          <div className="h-16 bg-gray-900 px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4 text-white">
                <span className="bg-primary px-3 py-1 rounded-lg text-xs font-black uppercase">Visual Builder</span>
                <h2 className="font-black text-sm sm:text-base">Membangun Layout Hook: {formData.title || 'Untitled'}</h2>
             </div>
             <button 
              onClick={() => setShowVisualBuilder(false)}
              className="p-2 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all transform hover:rotate-90 duration-300"
             >
               <X size={24} />
             </button>
          </div>
          <div className="flex-grow bg-gray-100 overflow-hidden">
             <VisualHookBuilder 
                products={selectedProductsData}
                initialConfig={formData.visual_config}
                onSave={(config) => {
                  setFormData(prev => ({ ...prev, visual_config: config }))
                  toast.success('Layout visual diperbarui! Jangan lupa simpan hook di dashboard.')
                }}
             />
          </div>
        </div>
      )}
    </div>
  )
}
