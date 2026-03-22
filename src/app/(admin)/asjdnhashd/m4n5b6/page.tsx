import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutGrid, Package, MousePointer2, Plus, ArrowUpRight } from 'lucide-react'
import { redirect } from 'next/navigation'
import ProductStatusToggle from '@/components/ProductStatusToggle'

export const dynamic = 'force-dynamic'

export default async function StudioDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const totalProducts = products?.length || 0
  const totalClicks = products?.reduce((acc, p) => acc + (p.clicks || 0), 0) || 0
  const activeProducts = products?.filter(p => p.is_active).length || 0

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Selamat datang kembali, Admin.</p>
        </div>
        <Link href={`/${process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'}/${process.env.NEXT_PUBLIC_PRODUCTS_PATH || 'p1o2i3'}/new`} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          <span>Tambah Produk</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
            <Package size={24} />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalProducts}</div>
          <div className="text-sm font-medium text-gray-500">Total Produk</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
            <MousePointer2 size={24} />
          </div>
          <div className="text-2xl font-black text-gray-900">{totalClicks}</div>
          <div className="text-sm font-medium text-gray-500">Total Klik</div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-premium border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-4">
            <LayoutGrid size={24} />
          </div>
          <div className="text-2xl font-black text-gray-900">{activeProducts}</div>
          <div className="text-sm font-medium text-gray-500">Produk Aktif</div>
        </div>
      </div>

      {/* Recent Products Table */}
      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Produk Terbaru</h2>
          <Link href={`/${process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'}/products`} className="text-sm font-bold text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Klik</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {products?.slice(0, 5).map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 truncate max-w-[200px]">{product.title}</div>
                    <div className="text-xs text-gray-400">{product.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                      {product.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{product.clicks}</td>
                  <td className="px-6 py-4">
                    <ProductStatusToggle productId={product.id} initialStatus={product.is_active} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/${process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'}/${process.env.NEXT_PUBLIC_PRODUCTS_PATH || 'p1o2i3'}/${product.id}/edit`} 
                      className="inline-flex items-center gap-1 text-accent font-bold hover:text-primary transition-colors"
                    >
                      Edit <ArrowUpRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {totalProducts === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada produk. Silakan tambah produk baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
