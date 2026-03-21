import Sidebar, { useSidebarData } from '@/app/(admin)/Sidebar'
import MobileMenu from '@/app/(admin)/MobileMenu'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50/50">
      <Sidebar />
      <MobileMenu />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}
