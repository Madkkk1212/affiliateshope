import { createClient } from '@/lib/supabase/server'
import HookForm from '@/components/HookForm'
import { redirect } from 'next/navigation'

export default async function NewHookPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const loginSecret = process.env.NEXT_PUBLIC_LOGIN_PATH || 'y7z2k9'
    redirect(`/${adminPath}/${loginSecret}`)
  }

  // Fetch distinct categories from products table
  const { data: products } = await supabase.from('products').select('category')
  const categories = Array.from(new Set(products?.map(p => p.category).filter(Boolean))) as string[]

  return (
    <div className="p-6 lg:p-10">
      <HookForm categories={categories} />
    </div>
  )
}
