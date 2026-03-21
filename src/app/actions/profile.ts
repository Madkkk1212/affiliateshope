'use client'

import { createClient } from '@/lib/supabase/client'

export async function updateAffiliateId(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .update({ affiliate_id: id })
    .eq('id', user.id)

  if (error) throw error
  return { success: true }
}

export async function getAffiliateId() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('affiliate_id')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data.affiliate_id
}
