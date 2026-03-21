import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Edit3, ArrowUpRight } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import ImportButton from '@/components/ImportButton'
import AutoScraperButton from '@/components/AutoScraperButton'
import ProductStatusToggle from '@/components/ProductStatusToggle'

export const dynamic = 'force-dynamic'

export default async function ProductListPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Semua Produk</h1>
          <p className="text-gray-500">Kelola daftar tautan affiliate Anda.</p>
        </div>
        <div className="flex gap-3">
          <AutoScraperButton />
          <ImportButton />
          <Link href="/studio/products/new" className="btn-primary flex items-center gap-2 w-fit">
            <Plus size={20} />
            <span>Produk Baru</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Info Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4 text-center">Analitik</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                          <Image src={product.image} alt="" fill sizes="40px" className="object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900 line-clamp-1">{product.title}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="truncate max-w-[150px]">{product.slug}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase whitespace-nowrap">
                      {product.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-black text-primary">{product.clicks}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Klik</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ProductStatusToggle productId={product.id} initialStatus={product.is_active} />
                  </td>
                  <td className="px-6 py-4 text-right text-accent font-bold">
                    <div className="flex justify-end gap-3">
                      <Link href={`/studio/products/${product.id}/edit`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit3 size={18} />
                      </Link>
                      <Link href={`/${product.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View Public">
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Belum ada produk. Mulai dengan membuat produk pertama Anda.
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
