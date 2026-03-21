'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Package, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/studio/login')
    router.refresh()
  }

  const menuItems = [
    { title: 'Dashboard', icon: LayoutGrid, href: '/studio/dashboard' },
    { title: 'Semua Produk', icon: Package, href: '/studio/products' },
    { title: 'Pengaturan', icon: Settings, href: '/studio/settings' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-gray-50 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <LayoutGrid size={24} />
        </div>
        <span className="text-xl font-black tracking-tighter">Studio</span>
      </div>

      <nav className="flex-grow p-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all",
              pathname === item.href 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-gray-500 hover:bg-gray-50 hover:text-accent"
            )}
          >
            <item.icon size={20} />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
