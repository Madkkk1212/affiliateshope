'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { updateAffiliateId, getAffiliateId } from '@/app/actions/profile'

export default function SettingsPage() {
  const [affiliateId, setAffiliateId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const id = await getAffiliateId()
        if (id) setAffiliateId(id)
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      await updateAffiliateId(affiliateId)
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menyimpan pengaturan.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <Settings className="text-primary" size={32} />
          Pengaturan
        </h1>
        <p className="text-gray-500 mt-2">Konfigurasi akun dan sistem affiliate Anda.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-lg">Shopee Affiliate Configuration</h2>
          <p className="text-sm text-gray-500">ID ini akan digunakan untuk mengubah link Shopee biasa menjadi link affiliate secara otomatis.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Shopee Affiliate ID</label>
            <input 
              type="text" 
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
              placeholder="Contoh: 123456789"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
              required
            />
            <p className="text-xs text-gray-400">Dapatkan Affiliate ID Anda dari dashboard Shopee Affiliate Program.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="btn-primary w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4"
            >
              {saving ? (
                <><Loader2 className="animate-spin" size={20} /> Menyimpan...</>
              ) : (
                <><Save size={20} /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Guide Card */}
      <div className="mt-8 p-8 bg-violet-50 rounded-3xl border border-violet-100">
        <h3 className="font-bold text-violet-900 mb-2">💡 Tips Shopee Affiliate</h3>
        <p className="text-sm text-violet-700 leading-relaxed">
          Setelah menyimpan Affiliate ID, setiap link produk yang Anda masukkan lewat <strong>Auto-Scraper</strong> atau <strong>Bulk Import</strong> akan otomatis diubah menjadi link affiliate resmi (format <code>s.shopee.co.id/an_redir</code>). Anda tidak perlu lagi melakukan copy-paste link affiliate secara manual.
        </p>
      </div>
    </div>
  )
}
