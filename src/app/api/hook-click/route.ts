import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { hookId } = await request.json()
    console.log('--- HOOK VIEW TRACKING HIT ---', hookId)
    
    if (!hookId) {
      return NextResponse.json({ error: 'Hook ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Panggil RPC untuk increment_hook_views
    const { error: rpcError } = await supabase.rpc('increment_hook_views', { 
      hook_id: hookId 
    })

    if (rpcError) {
      throw rpcError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Hook tracking error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message || 'Error recording click'
    }, { status: 500 })
  }
}
