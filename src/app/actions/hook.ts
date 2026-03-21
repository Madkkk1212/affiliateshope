'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'

export async function saveHook(data: any, id?: string) {
  const supabase = await createClient()

  try {
    const { products: hookProducts, images: hookImages, popup, visual_config, ...hookSubData } = data
    
    let hookId = id
    
    if (id) {
      const { error } = await supabase.from('hooks').update({ ...hookSubData, visual_config }).eq('id', id)
      if (error) throw error
    } else {
      const { data: newHook, error } = await supabase.from('hooks').insert([{ ...hookSubData, visual_config }]).select().single()
      if (error) throw error
      hookId = newHook.id
    }

    // Handle Products
    if (hookProducts) {
      // Clear existing
      await supabase.from('hook_products').delete().eq('hook_id', hookId)
      // Insert new
      if (hookProducts.length > 0) {
        const productInserts = hookProducts.map((p: any, idx: number) => ({
          hook_id: hookId,
          product_id: typeof p === 'string' ? p : p.id,
          position: idx,
          show_in_popup: typeof p === 'object' ? !!p.show_in_popup : false
        }))
        const { error: pError } = await supabase.from('hook_products').insert(productInserts)
        if (pError) throw pError
      }
    }

    // Handle Images
    if (hookImages) {
      await supabase.from('hook_images').delete().eq('hook_id', hookId)
      if (hookImages.length > 0) {
        const imageInserts = hookImages.map((url: string) => ({
          hook_id: hookId,
          image_url: url
        }))
        const { error: iError } = await supabase.from('hook_images').insert(imageInserts)
        if (iError) throw iError
      }
    }

    // Handle Popup
    if (popup) {
      const { images: popupImages, ...popupSubData } = popup
      
      // Upsert popup
      const { data: existingPopup } = await supabase.from('hook_popups').select('id').eq('hook_id', hookId).single()
      
      let popupId
      if (existingPopup) {
        popupId = existingPopup.id
        const { error: puError } = await supabase.from('hook_popups').update(popupSubData).eq('id', popupId)
        if (puError) throw puError
      } else {
        const { data: newPopup, error: puError } = await supabase.from('hook_popups').insert([{ ...popupSubData, hook_id: hookId }]).select().single()
        if (puError) throw puError
        popupId = newPopup.id
      }

      // Handle Popup Images
      if (popupImages) {
        await supabase.from('popup_images').delete().eq('popup_id', popupId)
        if (popupImages.length > 0) {
          const pImageInserts = popupImages.map((url: string) => ({
            popup_id: popupId,
            image_url: url
          }))
          const { error: piError } = await supabase.from('popup_images').insert(pImageInserts)
          if (piError) throw piError
        }
      }
    }

    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'
    
    revalidatePath(`/${adminPath}/${hooksSecret}`)
    if (hookSubData.slug) {
      revalidatePath(`/${hookSubData.slug}`)
      revalidatePath(`/${hookSubData.slug}/list`)
    }
    
    return { success: true, id: hookId }
  } catch (err: any) {
    console.error('Error saving hook:', err)
    return { success: false, error: err.message || 'Gagal menyimpan hook' }
  }
}

export async function deleteHook(id: string) {
  const supabase = await createClient()
  try {
    const { data: hook } = await supabase.from('hooks').select('slug').eq('id', id).single()
    const { error } = await supabase.from('hooks').delete().eq('id', id)
    if (error) throw error

    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'
    
    revalidatePath(`/${adminPath}/${hooksSecret}`)
    if (hook?.slug) {
      revalidatePath(`/${hook.slug}`)
      revalidatePath(`/${hook.slug}/list`)
    }
    
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menghapus hook' }
  }
}

export async function duplicateHook(id: string) {
  const supabase = await createClient()
  try {
    // 1. Get original hook
    const { data: hook, error: hErr } = await supabase.from('hooks').select('*, hook_products(*), hook_images(*), hook_popups(*, popup_images(*))').eq('id', id).single()
    if (hErr) throw hErr

    // 2. Prepare new hook data
    const newSlug = `${hook.slug}-copy-${Math.floor(Math.random() * 1000)}`
    const { products, hook_products, hook_images, hook_popups, ...hookData } = hook
    
    const cleanHookData = {
      title: `${hook.title} (Copy)`,
      slug: newSlug,
      description: hook.description,
      category: hook.category,
      status: 'draft',
      visual_config: hook.visual_config
    }

    const { data: newHook, error: nhErr } = await supabase.from('hooks').insert([cleanHookData]).select().single()
    if (nhErr) throw nhErr

    // 3. Duplicate products
    if (hook_products && hook_products.length > 0) {
      const pInserts = hook_products.map((p: any) => ({
        hook_id: newHook.id,
        product_id: p.product_id,
        position: p.position,
        show_in_popup: p.show_in_popup // Copy the selection
      }))
      await supabase.from('hook_products').insert(pInserts)
    }

    // 4. Duplicate images
    if (hook_images && hook_images.length > 0) {
      const iInserts = hook_images.map((img: any) => ({
        hook_id: newHook.id,
        image_url: img.image_url
      }))
      await supabase.from('hook_images').insert(iInserts)
    }

    // 5. Duplicate popup
    if (hook_popups && hook_popups.length > 0) {
      const originalPopup = hook_popups[0]
      const { id: oldPid, hook_id: oldHid, popup_images: pi, ...pData } = originalPopup
      const { data: newPopup, error: npErr } = await supabase.from('hook_popups').insert([{ ...pData, hook_id: newHook.id }]).select().single()
      
      if (!npErr && pi && pi.length > 0) {
        const piInserts = pi.map((img: any) => ({
          popup_id: newPopup.id,
          image_url: img.image_url
        }))
        await supabase.from('popup_images').insert(piInserts)
      }
    }

    const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PATH || 'asjdnhashd'
    const hooksSecret = process.env.NEXT_PUBLIC_HOOKS_PATH || 'h7o8o9'
    
    revalidatePath(`/${adminSecret}/${hooksSecret}`)
    if (newHook.slug) {
      revalidatePath(`/${newHook.slug}`)
      revalidatePath(`/${newHook.slug}/list`)
    }

    return { success: true, id: newHook.id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal duplikasi hook' }
  }
}
