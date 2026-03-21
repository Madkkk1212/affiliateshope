'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { slugify } from '@/lib/utils'
import { Save, Loader2, ArrowLeft, Trash2, Globe, Plus, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { saveProduct, deleteProduct } from '@/app/actions/product'

interface ProductFormProps {
  initialData?: Product
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  // Client supabase init removed as it is now mostly unused, server actions will take over
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Product>>(
    initialData || {
      title: '',
      slug: '',
      description: '',
      image: '',
      price: '',
      discount_price: '',
      affiliate_url: '',
      category: '',
      badge: '',
      hook: '',
      is_active: true,
      images: [],
    }
  )

  const [imageList, setImageList] = useState<string[]>(
    initialData?.images && initialData.images.length > 0 
      ? initialData.images 
      : (initialData?.image ? [initialData.image] : [''])
  )

  // Auto-slugify title
  useEffect(() => {
    if (!initialData && formData.title) {
      setFormData(prev => ({ ...prev, slug: slugify(prev.title || '') }))
    }
  }, [formData.title, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sync image list to formData before submit
      const validImages = imageList.filter(img => img.trim() !== '')
      const finalData = {
        ...formData,
        price: formData.price === '' ? null : formData.price,
        discount_price: formData.discount_price === '' ? null : formData.discount_price,
        category: formData.category === '' ? null : formData.category,
        description: formData.description === '' ? null : formData.description,
        hook: formData.hook === '' ? null : formData.hook,
        badge: formData.badge === '' ? null : formData.badge,
        images: validImages,
        image: validImages.length > 0 ? validImages[0] : null, // Set main image for compatibility
      }

      const res = await saveProduct(finalData, initialData?.id)
      
      if (!res.success) {
        throw new Error(res.error)
      }

      if (initialData?.id) {
        toast.success('Produk diperbarui!')
        router.push('/studio/dashboard')
      } else {
        toast.success('Produk dibuat!')
        router.push('/studio/dashboard')
      }
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi API Server'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initialData?.id) return
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    setLoading(true)
    try {
      const res = await deleteProduct(initialData.id)
      if (!res.success) throw new Error(res.error)
      
      toast.success('Produk dihapus!')
      router.push('/studio/products')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <Toaster />
      <div className="flex items-center justify-between mb-8">
        <Link href="/studio/products" className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-accent transition-colors">
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar</span>
        </Link>
        {initialData && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
            title="Hapus Produk"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-8">
          {initialData ? 'Edit Produk' : 'Produk Baru'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nama Produk</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="Ex: Sepatu Lari Ultra"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Slug (SEO)</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="sepatu-lari-ultra"
              />
            </div>
          </div>

          {/* Pricing & Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Harga Coret (Asli)</label>
                <input
                  type="text"
                  value={formData.price || ''}
                  onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Ex: 500000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Harga Diskon</label>
                <input
                  type="text"
                  value={formData.discount_price || ''}
                  onChange={e => setFormData(prev => ({ ...prev, discount_price: e.target.value }))}
                  onBlur={e => {
                    const val = e.target.value.trim()
                    if (val.endsWith('%')) {
                      const percent = parseFloat(val)
                      const originalPrice = parseFloat(formData.price || '0')
                      if (!isNaN(percent) && !isNaN(originalPrice) && originalPrice > 0) {
                        const discounted = originalPrice - (originalPrice * percent / 100)
                        setFormData(prev => ({ ...prev, discount_price: Math.max(0, discounted).toFixed(0) }))
                      }
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="Ex: 250000 atau 50%"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Affiliate URL</label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={formData.affiliate_url}
                  onChange={e => setFormData(prev => ({ ...prev, affiliate_url: e.target.value }))}
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  placeholder="https://shopee.co.id/..."
                />
                <Globe className="absolute left-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Image URLs & Tags */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center justify-between">
                <span>Daftar Image URL</span>
                <button
                  type="button"
                  onClick={() => setImageList([...imageList, ''])}
                  className="text-xs flex items-center gap-1 text-primary hover:text-orange-600 border border-primary/20 px-2 py-1 rounded-md"
                >
                  <Plus size={14} /> Tambah Foto
                </button>
              </label>
              
              <div className="space-y-2 max-h-48 overflow-y-auto px-1 hide-scrollbar">
                {imageList.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={img}
                      onChange={e => {
                        const newList = [...imageList]
                        newList[idx] = e.target.value
                        setImageList(newList)
                      }}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-sm"
                      placeholder={`URL Foto ${idx + 1} (https://...)`}
                    />
                    {imageList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setImageList(imageList.filter((_, i) => i !== idx))}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Foto pertama akan menjadi foto utama (thumbnail).</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Kategori</label>
              <select
                value={formData.category || ''}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
              >
                <option value="">Pilih Kategori</option>
                <option value="Fashion">Fashion</option>
                <option value="Electro">Electro</option>
                <option value="Home">Home</option>
                <option value="Health">Health</option>
              </select>
            </div>
          </div>

          {/* Conversion Hook & Badge */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Selling Hook (Viral Text)</label>
              <input
                type="text"
                value={formData.hook || ''}
                onChange={e => setFormData(prev => ({ ...prev, hook: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="Ex: Masih cari sepatu yang bikin kaki lecet?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Promo Badge</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={e => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                placeholder="Ex: Terlaris / Diskon 50%"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Deskripsi Produk & Penjelasan Solusi</label>
            <textarea
              value={formData.description || ''}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
              placeholder="Jelaskan kenapa produk ini adalah solusi terbaik..."
            />
          </div>

          {/* Active Switch */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-gray-700 cursor-pointer">
              Tampilkan Produk di Publik
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-10"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{loading ? 'Menyimpan...' : 'Simpan Produk'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}
