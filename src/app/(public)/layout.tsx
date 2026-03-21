import Navbar from '@/components/Navbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Lumahive Rekomendasi. Powered by Next.js & Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}
