'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProduct(data: any, id?: string) {
  const supabase = await createClient()

  try {
    if (id) {
      const { error } = await supabase.from('products').update(data).eq('id', id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('products').insert([data])
      if (error) throw error
    }

    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    revalidatePath(`/${adminSecret}/products`)
    revalidatePath(`/${adminSecret}/dashboard`)
    revalidatePath('/')
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan produk' }
  }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error

    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    revalidatePath(`/${adminSecret}/products`)
    revalidatePath(`/${adminSecret}/dashboard`)
    revalidatePath('/')
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus produk' }
  }
}
