import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search, Edit3, Anchor, Eye, Copy, Trash2, MoreHorizontal } from 'lucide-react'
import { redirect } from 'next/navigation'
import { duplicateHook, deleteHook } from '@/app/actions/hook'
import { format } from 'date-fns'
import HookActions from '@/components/HookActions'
import HookFilters from '@/components/HookFilters'
import { Toaster } from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default async function HookListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string }>
}) {
  const { q, category, status } = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const loginSecret = process.env.NEXT_PUBLIC_LOGIN_PATH || 'y7z2k9'
    redirect(`/${adminPath}/${loginSecret}`)
  }

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
  const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'

  let query = supabase
    .from('hooks')
    .select(`
      *,
      hook_products(count)
    `)
    .order('created_at', { ascending: false })

  if (q) query = query.ilike('title', `%${q}%`)
  if (category) query = query.eq('category', category)
  if (status) query = query.eq('status', status)

  const { data: hooks } = await query

  // Fetch distinct categories from products table for filter dropdown
  const { data: pCats } = await supabase.from('products').select('category')
  const categories = Array.from(new Set(pCats?.map(p => p.category).filter(Boolean))) as string[]

  return (
    <div className="p-6 lg:p-10">
      <Toaster />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Hook Manager</h1>
          <p className="text-gray-500">Kelola sistem affiliate berbasis kategori.</p>
        </div>
        <Link 
          href={`/${adminPath}/${hooksSecret}/new`} 
          className="btn-primary flex items-center gap-2 w-fit"
        >
          <Plus size={20} />
          <span>Hook Baru</span>
        </Link>
      </div>

      <HookFilters 
        categories={categories} 
        initialQ={q || ''} 
        initialCategory={category || ''} 
        initialStatus={status || ''} 
      />

      <div className="bg-white rounded-3xl shadow-premium border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Hook Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Products</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {hooks?.map((hook) => (
                <tr key={hook.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{hook.title}</div>
                    <div className="text-xs text-gray-400">/{hook.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    {hook.category || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-primary bg-primary/5 px-3 py-1 rounded-full">
                      {hook.hook_products?.[0]?.count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      hook.status === 'publish' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {hook.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(hook.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <HookActions 
                      hook={hook} 
                      adminPath={adminPath} 
                      hooksSecret={hooksSecret} 
                    />
                  </td>
                </tr>
              ))}
              {hooks?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">
                    Belum ada hook. Tekan "Hook Baru" untuk memulai.
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
