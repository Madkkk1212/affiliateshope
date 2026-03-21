'use client'

import { useState } from 'react'
import { X, Globe, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CATEGORY_GROUPS } from '@/constants/categories'
import CategorySelect from '@/components/CategorySelect'

interface AutoScraperImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

type LinkStatus = 'pending' | 'processing' | 'success' | 'failed'

interface ProcessedLink {
  url: string;
  status: LinkStatus;
  message?: string;
  title?: string;
}

export default function AutoScraperImport({ onClose, onSuccess }: AutoScraperImportProps) {
  const [urlsText, setUrlsText] = useState('')
  const [links, setLinks] = useState<ProcessedLink[]>([])
  const [category, setCategory] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({ success: 0, failed: 0 })
  
  const router = useRouter()

  const parseLinks = () => {
    const raw = urlsText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (raw.length === 0) return

    setLinks(raw.map(url => ({
      url,
      status: 'pending'
    })))
  }

  const startImport = async () => {
    if (links.length === 0) return
    
    setIsProcessing(true)
    let currentSuccess = 0
    let currentFailed = 0

    // Process one by one for real-time feedback and preventing long timeouts
    for (let i = 0; i < links.length; i++) {
        // Update current to processing
        setLinks(prev => prev.map((link, idx) => idx === i ? { ...link, status: 'processing', message: 'Membuka browser siluman...' } : link))

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    links: [links[i].url],
                    category: category
                })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                let errMsg = errData.error || 'Gagal menghubungi proxy API'
                if (errMsg.includes('fetch failed')) {
                   errMsg = 'Server Robot Python mati. Pastikan uvicorn berjalan!'
                }
                throw new Error(errMsg)
            }

            const data = await res.json()
            const result = data[0]

            if (result && result.status === 'success') {
                currentSuccess++
                const msg = result.price_min == null ? 'Foto & Judul berhasil! Harga mungkin kosong, silakan cek via Edit.' : 'Berhasil!'
                setLinks(prev => prev.map((link, idx) => idx === i ? { ...link, status: 'success', title: result.title, message: msg } : link))
            } else {
                currentFailed++
                setLinks(prev => prev.map((link, idx) => idx === i ? { ...link, status: 'failed', message: result?.error || 'Unknown error' } : link))
            }
        } catch (error: any) {
            currentFailed++
            setLinks(prev => prev.map((link, idx) => idx === i ? { ...link, status: 'failed', message: error.message } : link))
        }

        setStats({ success: currentSuccess, failed: currentFailed })
        
        // Extra delay handled by API/Python, but added safety on client
        if (i < links.length - 1) {
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    setIsProcessing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-violet-50/50">
          <div>
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
                <Globe className="text-violet-500" />
                Auto-Scraper (Python)
            </h2>
            <p className="text-sm text-gray-500 mt-1">Paste link Shopee dan biarkan robot mengambil data dan foto.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {links.length === 0 ? (
             <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Pilih Kategori Produk</label>
                    <CategorySelect 
                        value={category} 
                        onChange={val => setCategory(val)} 
                        placeholder="-- Pilih Kategori --"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Daftar Link Affiliate Shopee</label>
                    <textarea
                        value={urlsText}
                        onChange={e => setUrlsText(e.target.value)}
                        placeholder="https://shopee.co.id/product/123/456&#10;https://shopee.co.id/product/789/012&#10;(Satu link per baris)"
                        className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                    />
                </div>
             </div>
          ) : (
             <div className="space-y-4">
                <div className="flex bg-gray-50 p-4 rounded-xl items-center justify-between border border-gray-100">
                    <div className="text-sm font-bold text-gray-700">Total: {links.length} Link</div>
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={16}/> {stats.success} Sukses</span>
                        <span className="text-red-500 flex items-center gap-1"><AlertCircle size={16}/> {stats.failed} Gagal</span>
                    </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 hide-scrollbar">
                    {links.map((link, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                            link.status === 'processing' ? 'border-blue-200 bg-blue-50/50' :
                            link.status === 'success' ? 'border-green-200 bg-green-50/50' :
                            link.status === 'failed' ? 'border-red-200 bg-red-50/50' :
                            'border-gray-100 bg-gray-50/50'
                        }`}>
                            <div className="mt-0.5 shrink-0">
                                {link.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-gray-300" />}
                                {link.status === 'processing' && <Loader2 size={20} className="text-blue-500 animate-spin" />}
                                {link.status === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
                                {link.status === 'failed' && <AlertCircle size={20} className="text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 truncate font-mono">{link.url}</p>
                                {link.title && <p className="font-bold text-gray-900 text-sm mt-1">{link.title}</p>}
                                {link.message && (
                                    <p className={`text-xs mt-1 font-medium ${link.status === 'failed' ? 'text-red-600' : link.status === 'success' ? 'text-green-600' : 'text-blue-600'}`}>
                                        {link.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            {stats.success > 0 && !isProcessing ? 'Selesai' : 'Batal'}
          </button>
          
          {links.length === 0 ? (
            <button 
                onClick={parseLinks}
                disabled={urlsText.trim().length === 0}
                className="bg-violet-600 text-white hover:bg-violet-700 px-6 py-2.5 rounded-xl font-bold transition-all min-w-[140px] flex items-center justify-center gap-2"
            >
                Preview Link
            </button>
          ) : !isProcessing && currentStatusNotDone(links) ? (
            <button 
                onClick={startImport}
                className="bg-violet-600 text-white hover:bg-violet-700 px-6 py-2.5 rounded-xl font-bold transition-all min-w-[140px] flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30"
            >
                <Globe size={18} /> Mulai Auto-Scrape
            </button>
          ) : null}

          {!isProcessing && stats.success > 0 && !currentStatusNotDone(links) && (
              <button 
                onClick={() => {
                    onSuccess()
                    onClose()
                }}
                className="bg-green-600 text-white hover:bg-green-700 px-6 py-2.5 rounded-xl font-bold transition-all min-w-[140px] flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                  <Save size={18} /> Lihat Hasil
              </button>
          )}

        </div>
      </div>
    </div>
  )
}

// Utility check if there are pending or failed links (we could retry failed, but for now we just check if pending exists)
function currentStatusNotDone(links: ProcessedLink[]) {
    return links.some(l => l.status === 'pending');
}
