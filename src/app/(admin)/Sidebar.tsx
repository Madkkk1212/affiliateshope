'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, Package, Settings, LogOut, Anchor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function useSidebarData() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const loginSecret = process.env.NEXT_PUBLIC_LOGIN_PATH || 'y7z2k9'
    router.push(`/${adminPath}/${loginSecret}`)
    router.refresh()
  }

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
  const dashboardSecret = process.env.NEXT_PUBLIC_DASHBOARD_PATH || 'm4n5b6'
  const productsSecret = process.env.NEXT_PUBLIC_PRODUCTS_PATH || 'p1o2i3'
  const settingsSecret = process.env.NEXT_PUBLIC_SETTINGS_PATH || 's4d5f6'
  const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'

  const menuItems = [
    { title: 'Dashboard', icon: LayoutGrid, href: `/${adminPath}/${dashboardSecret}` },
    { title: 'Hook Manager', icon: Anchor, href: `/${adminPath}/${hooksSecret}` },
    { title: 'Semua Produk', icon: Package, href: `/${adminPath}/${productsSecret}` },
    { title: 'Pengaturan', icon: Settings, href: `/${adminPath}/${settingsSecret}` },
  ]

  return { menuItems, handleLogout }
}

export default function Sidebar() {
  const pathname = usePathname()
  const { menuItems, handleLogout } = useSidebarData()

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
