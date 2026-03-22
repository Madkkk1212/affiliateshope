from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from playwright.async_api import async_playwright, Page
from playwright_stealth import Stealth
import asyncio
import sys
import re

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

class ImportRequest(BaseModel):
    links: List[str]

class ScrapeResult(BaseModel):
    affiliate_link: str
    status: str
    title: Optional[str] = None
    price: Optional[str] = None          # Harga coret (Format Rp)
    discount_price: Optional[str] = None # Harga promo (Format Rp)
    price_min: Optional[int] = None      # Angka bersih
    price_max: Optional[int] = None      # Angka bersih
    images: Optional[List[str]] = None
    image: Optional[str] = None          # Gambar utama
    error: Optional[str] = None

# Fungsi untuk normalisasi harga (Rp157.998 -> 157998)
def normalize_price(price_text: str) -> int:
    try:
        clean = re.sub(r'[^0-9]', '', price_text)
        val = int(clean) if clean else 0
        # Prevent Postgres BIGINT overflow (max ~9.2e18)
        return val if val < 9000000000000000000 else 0
    except:
        return 0

async def extract_product_data(page, url):
    try:
        # Navigasi
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        await page.wait_for_timeout(3000)
        
        # 1. Judul
        og_title = await page.get_attribute('meta[property="og:title"]', 'content')
        title = og_title if og_title else "No Title"
        
        # 2. EKSTRAKSI HARGA DARI UI (SUPER PRIORITAS)
        # Cari elemen yang terlihat paling besar dan mengandung Rp di dekat judul
        price_ui_data = await page.evaluate('''() => {
            const results = {
                main_price_text: null,
                old_price_text: null,
                is_range: false
            };

            // 1. Cari Harga Utama (Terlihat Paling Besar & Tidak Dicoret)
            // Shopee biasanya menggunakan div/span dengan font-size besar untuk harga utama
            let allElements = Array.from(document.querySelectorAll('div, span, p'));
            
            // Filter elemen yang mengandung "Rp" dan terlihat (bukan data tersembunyi)
            let rpElements = allElements.filter(el => {
                const style = window.getComputedStyle(el);
                const text = el.innerText.trim();
                return text.includes('Rp') && 
                       text.length < 100 && // Hindari mengambil container raksasa dengan seluruh text page
                       style.display !== 'none' && 
                       style.visibility !== 'hidden' &&
                       !style.textDecoration.includes('line-through');
            });

            // Urutkan berdasarkan font-size
            rpElements.sort((a, b) => {
                const sizeA = parseFloat(window.getComputedStyle(a).fontSize);
                const sizeB = parseFloat(window.getComputedStyle(b).fontSize);
                return sizeB - sizeA;
            });

            if (rpElements.length > 0) {
                // Harga utama adalah yang paling besar (biasanya di atas)
                results.main_price_text = rpElements[0].innerText.trim();
                if (results.main_price_text.includes('-')) {
                    results.is_range = true;
                }
            }

            // 2. Cari Harga Coret (Jika ada)
            let oldPriceElements = allElements.filter(el => {
                const style = window.getComputedStyle(el);
                return el.innerText.includes('Rp') && 
                       style.textDecoration.includes('line-through');
            });

            if (oldPriceElements.length > 0) {
                results.old_price_text = oldPriceElements[0].innerText.trim();
            }

            return results;
        }''')

        main_price_text = price_ui_data['main_price_text']
        old_price_text = price_ui_data['old_price_text']
        
        price_min = 0
        price_max = 0
        final_price_raw = None # price (harga coret)
        final_discount_price_raw = None # discount_price (harga utama)

        if main_price_text:
            # Bersihkan range jika ada (Rp157.998 - Rp168.000)
            parts = main_price_text.split('-')
            if len(parts) > 1:
                price_min = normalize_price(parts[0])
                price_max = normalize_price(parts[1])
            else:
                price_min = price_max = normalize_price(main_price_text)

            # Aturan User:
            # Jika ada harga coret:
            # - price = harga coret (old_price_text)
            # - discount_price = harga utama (main_price_text)
            if old_price_text:
                final_price_raw = old_price_text
                final_discount_price_raw = main_price_text
            else:
                # Jika tidak ada diskon:
                # - price = harga utama
                # - discount_price = null
                final_price_raw = main_price_text
                final_discount_price_raw = None

        # 3. EKSTRAKSI GAMBAR GALERI (Hanya galeri utama kiri)
        images: List[str] = []
        # Ambil semua gambar yang memiliki pola link file Shopee
        # Biasanya di galeri utama, gambarnya punya format khusus
        img_elements = await page.query_selector_all('img')
        for img in img_elements:
            src = await img.get_attribute('src')
            if src and 'file/' in src:
                # Abaikan gambar profil toko atau icon kecil lainnya (biasanya < 100px)
                # Tapi karena kita di headless, kita cek dari URL-nya saja
                if 'static' in src or 'video' in src: continue
                
                # Bersihkan URL untuk mendapatkan versi original/besar
                # Shopee menggunakan suffix seperti _tn atau _original
                clean_src = src.split('_tn')[0].split('_xh')[0].split('?')[0]
                
                if clean_src not in images:
                    images.append(clean_src)
        
        # Filter: Produk Shopee biasanya punya minimal 1-8 gambar di galeri utama
        # Kita ambil 10 pertama yang unik (menghindari gambar rekomendasi di bawah)
        images = [img for i, img in enumerate(images) if i < 10]
        main_image = images[0] if images else None

        return ScrapeResult(
            affiliate_link=url,
            status="success",
            title=title,
            price=final_price_raw,
            discount_price=final_discount_price_raw,
            price_min=price_min,
            price_max=price_max,
            image=main_image,
            images=images
        )
    except Exception as e:
        return ScrapeResult(affiliate_link=url, status="failed", error=str(e))

@app.post("/import", response_model=List[ScrapeResult])
async def import_products(request: ImportRequest):
    results = []
    context = None # Initialize context to None
    
    async with async_playwright() as p:
        try:
            # Gunakan browser standar dengan User-Agent Googlebot (Bypass Login/Language modal)
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                viewport={"width": 1280, "height": 720}
            )
            
            for url in request.links:
                # Hindari crash jika URL kosong
                if not url.strip():
                    continue
                    
                page = await context.new_page()
                await Stealth().apply_stealth_async(page)
                
                # Scrape data
                res = await extract_product_data(page, url.strip())
                results.append(res)
                
                await page.close()
                
                # Delay sedikit
                await asyncio.sleep(2)
        finally:
            if 'browser' in locals():
                await browser.close()
        
    return results

if __name__ == "__main__":
    import uvicorn
    import sys
    import asyncio
    
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
    uvicorn.run("main:app", host="127.0.0.1", port=8000)
