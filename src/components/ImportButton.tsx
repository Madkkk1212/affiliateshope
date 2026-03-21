'use client'

import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import BulkImport from './BulkImport'
import { useRouter } from 'next/navigation'

export default function ImportButton() {
  const [showImport, setShowImport] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setShowImport(false)
    router.refresh() // Refresh the server component product list
  }

  return (
    <>
      <button 
        onClick={() => setShowImport(true)}
        className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 flex items-center gap-2 font-bold transition-colors shadow-sm"
      >
        <FileSpreadsheet size={18} />
        <span>Import via Excel</span>
      </button>

      {showImport && (
        <BulkImport onClose={() => setShowImport(false)} onSuccess={handleSuccess} />
      )}
    </>
  )
}
