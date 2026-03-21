import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Inisialisasi Gemini (akan gagal dengan gracefully jika API Key belum dipasang)
const apiKey = process.env.GEMINI_API_KEY
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export async function POST(req: Request) {
  try {
    const { title } = await req.json()

    if (!title) {
      return NextResponse.json({ error: 'Nama produk diperlukan' }, { status: 400 })
    }

    if (!genAI) {
      // Jika user belum menaruh GEMINI_API_KEY di .env.local, berikan fallback kosong
      // Jadi aplikasinya tidak crash
      return NextResponse.json({
        description: '',
        hook: '',
        badge: '',
        category: 'Fashion', // Default safe category
      })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Saya adalah seorang Affiliate Marketer profesional.
      Tolong buatkan teks marketing singkat untuk produk dengan nama asli dari e-commerce: "${title}".
      
      Aturan format (hanya kembalikan JSON persis seperti di bawah, TANPA backtick markdown):
      {
        "description": "2-3 kalimat deskripsi solusi yang sangat persuasif, menyoroti manfaat utama produk ini",
        "hook": "1 kalimat headline pendek yang sangat viral, memicu FOMO (Fear of Missing Out) atau rasa penasaran",
        "badge": "2-3 kata pendek untuk badge promosi (misal: '🔥 Terlaris', 'Terbaik', 'Diskon Spesial', atau yang relevan)",
        "category": "Pilih SATU dari kategori berikut yang paling cocok: Fashion, Electro, Home, Health"
      }
    `

    const result = await model.generateContent(prompt)
    let text = result.response.text().trim()
    
    // Hilangkan backticks json bawaan gemini (e.g., ```json\n{...}\n```)
    if (text.startsWith('```json')) {
        text = text.substring(7)
    }
    if (text.startsWith('```')) {
        text = text.substring(3)
    }
    if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3)
    }
    
    const parsed = JSON.parse(text)

    return NextResponse.json({
      description: parsed.description || '',
      hook: parsed.hook || '',
      badge: parsed.badge || '',
      category: ['Fashion', 'Electro', 'Home', 'Health'].includes(parsed.category) ? parsed.category : 'Fashion',
    })

  } catch (error: any) {
    console.error('AI Generation Error:', error)
    // Jika AI gagal/limit, kembalikan data default saja supaya loop import tidak putus
    return NextResponse.json({
        description: '',
        hook: '',
        badge: '',
        category: 'Fashion',
    })
  }
}
