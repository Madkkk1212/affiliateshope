'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import AutoScraperImport from './AutoScraperImport'
import { useRouter } from 'next/navigation'

export default function AutoScraperButton() {
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
        className="px-4 py-2 border border-violet-200 text-violet-700 bg-violet-50 rounded-xl hover:bg-violet-100 flex items-center gap-2 font-bold transition-colors shadow-sm"
      >
        <Globe size={18} />
        <span>Auto Scraper Link</span>
      </button>

      {showImport && (
        <AutoScraperImport onClose={() => setShowImport(false)} onSuccess={handleSuccess} />
      )}
    </>
  )
}
