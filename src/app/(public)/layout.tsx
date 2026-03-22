import Navbar from '@/components/Navbar'
import { Suspense } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="h-16 w-full bg-white border-b border-gray-100 z-50"></div>}>
        <Navbar />
      </Suspense>
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Lumahive Rekomendasi.Biar Kami Yang Mencari.
          </p>
        </div>
      </footer>
    </div>
  )
}
