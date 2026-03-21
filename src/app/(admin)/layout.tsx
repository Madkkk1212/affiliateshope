import Sidebar from '@/app/(admin)/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}
