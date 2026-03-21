'use client'

import Link from 'next/link'
import { LayoutGrid, Search, Globe } from 'lucide-react'
import GoogleTranslate from './GoogleTranslate'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-gray-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">
            Lumahive <span className="text-primary">Rekomendasi</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <GoogleTranslate />
          <button className="p-2 text-gray-500 hover:text-primary transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>
    </nav>
  )
}
