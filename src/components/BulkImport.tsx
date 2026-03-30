'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { Download, Upload, FileSpreadsheet, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import { downloadImportTemplate } from '@/lib/exportTemplate'
import { useRouter } from 'next/navigation'
import { generateShopeeAffiliateLink } from '@/lib/affiliate'
import { CATEGORY_GROUPS } from '@/constants/categories'
import CategorySelect from '@/components/CategorySelect'

interface BulkImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImport({ onClose, onSuccess }: BulkImportProps) {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' })
  const [logs, setLogs] = useState<{ type: 'error' | 'success' | 'info'; message: string }[]>([])
  
  const excelInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000)
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0])
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files))
    }
  }

  const addLog = (type: 'error' | 'success' | 'info', message: string) => {
    setLogs(prev => [...prev, { type, message }])
  }

  const processImport = async () => {
    if (!excelFile) {
      addLog('error', 'Silakan unggah file Excel terlebih dahulu.')
      return
    }

    setLoading(true)
    setLogs([])
    setProgress({ current: 0, total: 0, message: 'Membaca file Excel...' })

    try {
      // 1. Read Excel
      const data = await excelFile.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet)

      // Get Affiliate ID from Profile
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('profiles')
        .select('affiliate_id')
        .eq('id', user?.id)
        .single()
      
      const affiliateId = profile?.affiliate_id || null

      setProgress({ current: 0, total: rows.length, message: `Ditemukan ${rows.length} baris data.` })

      let successCount = 0

      // 2. Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowIndex = i + 2 // +2 because 0-index and header row
        
        let title = row.title || Object.entries(row).find(([k]) => k.trim().toLowerCase() === 'nama produk')?.[1]?.toString().trim()
        let affiliate_url = row.affiliate_url || Object.entries(row).find(([k]) => k.trim().toLowerCase() === 'link komisi ekstra' || k.trim().toLowerCase() === 'Link Komisi Ekstra')?.[1]?.toString().trim()
        
        const priceValue = row.price || Object.entries(row).find(([k]) => k.trim().toLowerCase() === 'harga')?.[1]
        let stringPrice = priceValue?.toString().trim()
        let finalPrice: string | null = null
        
        if (stringPrice) {
          const str = String(stringPrice).toUpperCase()
          if (str.includes('RB')) {
             finalPrice = Math.floor(parseFloat(str.replace(',', '.')) * 1000).toString()
          } else if (str.includes('JT')) {
             finalPrice = Math.floor(parseFloat(str.replace(',', '.')) * 1000000).toString()
          } else {
             // remove any non digit for raw numbers if needed, but we'll just keep it parsing normally
             finalPrice = String(stringPrice).replace(/[^0-9]/g, '')
          }
        }

        setProgress(prev => ({ ...prev, current: i + 1, message: `Memproses baris ke-${rowIndex}...` }))

        if (!title || !affiliate_url) {
          addLog('error', `Baris ${rowIndex}: Gagal - Judul & Affiliate URL wajib diisi.`)
          continue
        }

        // Check for existing product to avoid duplicates
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('shopee_url', affiliate_url)
          .maybeSingle()

        if (existingProduct) {
          addLog('info', `Baris ${rowIndex}: Dilewati - Produk dengan link Shopee ini sudah ada.`)
          successCount++ // Count as success to trigger refresh if needed, or we can use a separate count
          continue
        }

        let publicImageUrl = null
        let finalDiscountPrice: string | null = null
        let scraperData: any = null
        
        // JIKA FORMAT SHOPEE (ADA Link Produk), PANGGIL ROBOT PYTHON UNTUK AMBIL DATA! (PRIORITAS LIVE)
        const linkProdukAsli = row['Link Komisi Ekstra']?.toString().trim()
        if (linkProdukAsli) {
          setProgress(prev => ({ ...prev, message: `Robot sedang mengambil data live dari Shopee (Baris ke-${rowIndex})...` }))
          try {
            const scrapeRes = await fetch('/api/scrape-direct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ links: [linkProdukAsli] })
            })
            if (scrapeRes.ok) {
              const dataList = await scrapeRes.json()
              const genData = dataList[0]
              scraperData = genData
              
              if (genData && genData.status === 'success') {
                  // SINKRONISASI FOTO
                  if (genData.images && genData.images.length > 0) {
                      publicImageUrl = genData.images[0]
                  }

                  // SINKRONISASI HARGA LIVE (MENIMPA CSV)
                  finalPrice = genData.price
                  finalDiscountPrice = genData.discount_price
                  
                  // Jika judul di CSV kosong, gunakan dari scraper
                  if (!title) title = genData.title

                  addLog('success', `Baris ${rowIndex}: Data live Shopee berhasil ditarik (Harga: ${finalDiscountPrice || finalPrice})`)
              } else {
                 addLog('info', `Baris ${rowIndex}: Gagal sinkronisasi live data, menggunakan data CSV.`)
              }
            }
          } catch (e: any) {
            addLog('info', `Baris ${rowIndex}: Robot tidak merespon, menggunakan data CSV.`)
          }
        }

        let expectedImageName = row.nama_file_foto?.toString().trim()
        if (expectedImageName && imageFiles.length > 0) {
           const matchingFile = imageFiles.find(f => f.name === expectedImageName)
           if (matchingFile) {
               setProgress(prev => ({ ...prev, message: `Mengkompres foto untuk baris ke-${rowIndex}...` }))
               try {
                  const options = {
                    maxSizeMB: 2,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                  }
                  const compressedFile = await imageCompression(matchingFile, options)
                  const fileName = `${Date.now()}-${generateSlug(title)}.jpg`
                  
                  setProgress(prev => ({ ...prev, message: `Mengunggah foto '${expectedImageName}'...` }))
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('products') // Asumsi bucket bernama products
                    .upload(fileName, compressedFile)
                    
                  if (uploadError) {
                     addLog('error', `Baris ${rowIndex}: Gagal upload foto - ${uploadError.message}`)
                  } else {
                     const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
                     publicImageUrl = publicUrl
                  }
               } catch (err: any) {
                  addLog('error', `Baris ${rowIndex}: Error saat mengolah foto - ${err.message}`)
               }
           } else {
               addLog('info', `Baris ${rowIndex}: File foto '${expectedImageName}' tidak ditemukan dalam unggahan Anda.`)
           }
        }

        // 4. Insert into database
        const slug = generateSlug(title)
        
        // TRANSFORM TO AFFILIATE LINK
        const finalAffiliateUrl = generateShopeeAffiliateLink(affiliate_url, affiliateId)

        setProgress(prev => ({ ...prev, message: `Menyimpan ke database (baris ke-${rowIndex})...` }))
        // Final INSERT
        const { error: dbError } = await supabase.from('products').insert({
          title: title,
          slug: slug,
          description: row.description ? String(row.description) : null,
          image: publicImageUrl,
          images: scraperData?.images && scraperData.images.length > 0 ? scraperData.images : (publicImageUrl ? [publicImageUrl] : []),
          price: finalPrice,
          discount_price: finalDiscountPrice,
          price_min: scraperData?.price_min || (finalPrice ? parseInt(String(finalPrice).replace(/[^0-9]/g, '')) : null),
          price_max: scraperData?.price_max || (finalPrice ? parseInt(String(finalPrice).replace(/[^0-9]/g, '')) : null),
          shopee_url: affiliate_url,       // Link Asli
          affiliate_url: finalAffiliateUrl, // Link an_redir
          category: selectedCategory || (row.category ? String(row.category) : null),
          badge: row.badge ? String(row.badge) : null,
          hook: row.hook ? String(row.hook) : null,
          is_active: row.is_active === 'FALSE' || row.is_active === false ? false : true,
        })

        if (dbError) {
          addLog('error', `Baris ${rowIndex}: Gagal menyimpan ke database - ${dbError.message}`)
        } else {
          successCount++
          addLog('success', `Baris ${rowIndex}: Produk '${title}' berhasil ditambahkan.`)
        }
      }

      setProgress({ current: rows.length, total: rows.length, message: `Selesai! ${successCount} dari ${rows.length} produk berhasil diimpor.` })
      
      if (successCount > 0) {
        setTimeout(() => {
          onSuccess()
        }, 3000)
      } else {
        setLoading(false)
      }

    } catch (err: any) {
      addLog('error', `Terjadi kesalahan internal: ${err.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Produk (Excel)</h2>
            <p className="text-sm text-gray-500 mt-1">Upload file excel dan foto seklaigus untuk bulk insert.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* Step 1: Template */}
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-5 space-y-4">
            <div>
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
                Pilih Kategori (Bulk)
              </h3>
              <CategorySelect 
                value={selectedCategory} 
                onChange={val => setSelectedCategory(val)} 
                placeholder="-- Gunakan Kategori dari Excel (Default) --"
              />
            </div>
            <hr className="border-orange-100" />
            <div>
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</span>
                Download Template
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Gunakan format Excel standar kami. Pastikan kolom nama_file_foto persis sama dengan nama file gambar yang Anda unggah.
              </p>
              <button 
                onClick={downloadImportTemplate}
                className="px-4 py-2 bg-white text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download Template Excel
              </button>
            </div>
          </div>

          {/* Step 2: Upload Files */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Upload */}
            <div 
              onClick={() => excelInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${excelFile ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
            >
              <input type="file" accept=".xlsx, .xls" ref={excelInputRef} className="hidden" onChange={handleExcelUpload} disabled={loading} />
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${excelFile ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <FileSpreadsheet size={24} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{excelFile ? 'File Excel Terpilih' : 'Upload Data Excel'}</p>
              <p className="text-xs text-gray-500 mt-1 truncate px-2">{excelFile ? excelFile.name : 'Klik untuk memilih file'}</p>
            </div>

            {/* Images Upload */}
            <div 
              onClick={() => imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${imageFiles.length > 0 ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
            >
              <input type="file" accept="image/*" multiple ref={imageInputRef} className="hidden" onChange={handleImageUpload} disabled={loading} />
              <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${imageFiles.length > 0 ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                <ImageIcon size={24} />
              </div>
              <p className="font-bold text-gray-900 text-sm">{imageFiles.length > 0 ? `${imageFiles.length} Foto Terpilih` : 'Upload Foto Produk'}</p>
              <p className="text-xs text-gray-500 mt-1">Pilih banyak foto sekaligus</p>
            </div>
          </div>

          {/* Progress & Logs */}
          {(loading || logs.length > 0) && (
            <div className="bg-gray-900 rounded-2xl p-5 text-gray-300 font-mono text-xs shadow-inner">
              <div className="mb-3 pb-3 border-b border-gray-800 flex items-center justify-between">
                <span>{progress.message}</span>
                {progress.total > 0 && (
                  <span className="text-primary font-bold">{progress.current} / {progress.total}</span>
                )}
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                {logs.map((log, idx) => (
                  <div key={idx} className={`flex items-start gap-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="mt-0.5">
                      {log.type === 'success' && <CheckCircle2 size={12} />}
                      {log.type === 'error' && <AlertCircle size={12} />}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Batal
          </button>
          <button 
            onClick={processImport}
            disabled={loading || !excelFile}
            className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Memproses</>
            ) : (
              <><Upload size={18} /> Mulai Import</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
