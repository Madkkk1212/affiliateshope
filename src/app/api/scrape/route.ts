import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'
import { generateShopeeAffiliateLink } from '@/lib/affiliate'

export async function POST(req: Request) {
  try {
    const { links, category } = await req.json()

    if (!links || !Array.isArray(links)) {
      return NextResponse.json({ error: 'Format link tidak valid' }, { status: 400 })
    }

    // 1. Panggil server Python (Lokal atau Ter-hosting)
    const scraperUrl = process.env.SCRAPER_URL || 'http://127.0.0.1:8000'
    const pythonResponse = await fetch(`${scraperUrl}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links }),
    })

    if (!pythonResponse.ok) {
      throw new Error(`Python server error: ${pythonResponse.statusText}`)
    }

    const scrapedData = await pythonResponse.json()
    const supabase = await createClient()

    // Ambil Affiliate ID dari Profile
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('affiliate_id')
      .eq('id', user?.id)
      .single()
    
    const affiliateId = profile?.affiliate_id || null

    const finalResults = []

    // 2. Loop melalui hasil scraping dan simpan ke Supabase
    for (const item of scrapedData) {
      if (item.status === 'failed') {
        finalResults.push(item)
        continue
      }

      // Cek duplikasi berdasar Affiliate Link (shopee_url)
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('shopee_url', item.affiliate_link)
        .maybeSingle()

      if (existing) {
        finalResults.push({
          ...item,
          status: 'failed',
          error: 'Produk sudah ada di database (Duplikat Affiliate Link)'
        })
        continue
      }

      // Format data untuk di-insert
      const slug = slugify(item.title) + '-' + Math.floor(Math.random() * 1000)
      const images = item.images && item.images.length > 0 ? item.images : []
      const mainImage = item.image || (images.length > 0 ? images[0] : null)
      
      // GENERATE AFFILIATE LINK SECARA OTOMATIS
      const affiliateUrl = generateShopeeAffiliateLink(item.affiliate_link, affiliateId)

      const { error: dbError } = await supabase.from('products').insert({
        title: item.title,
        slug: slug,
        price: item.price,
        discount_price: item.discount_price,
        price_min: item.price_min,
        price_max: item.price_max,
        image: mainImage,
        images: images,
        shopee_url: item.affiliate_link, // Link Asli
        affiliate_url: affiliateUrl,     // Link an_redir
        category: category || null,
        is_active: true,
      })

      if (dbError) {
        finalResults.push({
          ...item,
          status: 'failed',
          error: `Database error: ${dbError.message}`
        })
      } else {
        finalResults.push({
          ...item,
          status: 'success'
        })
      }
    }

    return NextResponse.json(finalResults)

  } catch (error: any) {
    console.error('Scrape API Error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
