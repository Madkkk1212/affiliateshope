'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface ProductStatusToggleProps {
  productId: string
  initialStatus: boolean
}

export default function ProductStatusToggle({ productId, initialStatus }: ProductStatusToggleProps) {
  const [isActive, setIsActive] = useState(initialStatus)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const toggleStatus = async () => {
    if (isLoading) return

    setIsLoading(true)
    const newStatus = !isActive
    // Optimistic UI update
    setIsActive(newStatus)

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', productId)

      if (error) {
        throw error
      }
      
      toast.success(`Produk ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`)
      router.refresh()
    } catch (error) {
      // Revert if failed
      setIsActive(!newStatus)
      const message = error instanceof Error ? error.message : 'Gagal memperbarui status'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={toggleStatus}
      disabled={isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        isActive ? 'bg-green-500' : 'bg-gray-200'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      role="switch"
      aria-checked={isActive}
    >
      <span className="sr-only">Toggle produk aktif</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
