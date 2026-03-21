'use client'

import { useState } from 'react'
import { Eye, Edit3, Copy, Trash2, Loader2, Link as LinkIcon, Check } from 'lucide-react'
import Link from 'next/link'
import { duplicateHook, deleteHook } from '@/app/actions/hook'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface HookActionsProps {
  hook: any
  adminPath: string
  hooksSecret: string
}

export default function HookActions({ hook, adminPath, hooksSecret }: HookActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const url = `${window.location.origin}/${hook.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDuplicate = async () => {
    setLoading(true)
    try {
      const res = await duplicateHook(hook.id)
      if (res.success) {
        toast.success('Hook diduplikasi!')
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

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus hook ini?')) return
    
    setLoading(true)
    try {
      const res = await deleteHook(hook.id)
      if (res.success) {
        toast.success('Hook dihapus!')
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

  return (
    <div className="flex justify-end gap-2">
      <Link href={`/${hook.slug}`} target="_blank" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-blue-500" title="Preview">
        <Eye size={18} />
      </Link>
      <Link href={`/${adminPath}/${hooksSecret}/${hook.id}/edit`} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-accent" title="Edit">
        <Edit3 size={18} />
      </Link>
      <button 
        onClick={handleCopy}
        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-orange-500" 
        title="Copy Link"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
      <button 
        disabled={loading}
        onClick={handleDuplicate}
        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-purple-500 disabled:opacity-30" 
        title="Duplicate"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
      </button>
      <button 
        disabled={loading}
        onClick={handleDelete}
        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-red-500 disabled:opacity-30" 
        title="Delete"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}
