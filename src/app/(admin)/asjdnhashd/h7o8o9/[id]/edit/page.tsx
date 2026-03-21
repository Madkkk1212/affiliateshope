import { createClient } from '@/lib/supabase/server'
import HookForm from '@/components/HookForm'
import { notFound, redirect } from 'next/navigation'

export default async function EditHookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const loginSecret = process.env.NEXT_PUBLIC_LOGIN_PATH || 'y7z2k9'
    redirect(`/${adminPath}/${loginSecret}`)
  }

  // Fetch hook with all relations
  const { data: hook } = await supabase
    .from('hooks')
    .select('*, hook_products(*), hook_images(*), hook_popups(*)')
    .eq('id', id)
    .single()

  if (!hook) notFound()

  // Fetch distinct categories from products table
  const { data: products } = await supabase.from('products').select('category')
  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[]

  return (
    <div className="p-6 lg:p-10">
      <HookForm initialData={hook} categories={categories} />
    </div>
  )
}
