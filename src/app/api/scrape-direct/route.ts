import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { links } = await req.json()

    if (!links || !Array.isArray(links)) {
      return NextResponse.json({ error: 'Format link tidak valid' }, { status: 400 })
    }

    // Panggil server Python (Lokal atau Ter-hosting)
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
    
    // Langsung kembalikan data, tidak di-insert ke DB (Klien yang akan insert)
    return NextResponse.json(scrapedData)

  } catch (error: any) {
    console.error('Scrape API Error:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
