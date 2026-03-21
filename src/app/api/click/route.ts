import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()
    console.log('--- CLICK TRACKING HIT ---', productId)
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Panggil RPC untuk increment
    const { error: rpcError } = await supabase.rpc('increment_product_clicks', { 
      product_id: productId 
    })

    if (rpcError) {
      throw rpcError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Click tracking error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message || 'Error recording click'
    }, { status: 500 })
  }
}
