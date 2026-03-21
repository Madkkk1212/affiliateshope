'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutGrid, Package, Settings, Anchor, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarData } from './Sidebar'

export default function MobileMenu() {
  const { menuItems, handleLogout } = useSidebarData()
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:hidden shrink-0">
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <LayoutGrid size={18} />
          </div>
          <span className="font-black text-lg tracking-tighter">Studio</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu Drawer */}
      <div className={cn(
        "fixed top-0 bottom-0 left-0 w-[280px] bg-white z-[80] shadow-2xl transition-transform duration-300 flex flex-col p-6",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter text-gray-900">Studio Admin</span>
        </div>

        <nav className="flex-grow space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all",
                pathname === item.href 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-accent"
              )}
            >
              <item.icon size={22} />
              <span className="text-lg">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-50">
          <button
            onClick={() => {
              setIsOpen(false)
              handleLogout()
            }}
            className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all w-full"
          >
            <LogOut size={22} />
            <span className="text-lg">Keluar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
