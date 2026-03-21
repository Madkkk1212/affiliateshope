import asyncio
from playwright.async_api import async_playwright
import json
from playwright_stealth import Stealth

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()
        await Stealth().apply_stealth_async(page)
        
        url = "https://shopee.co.id/product/874470075/28809766885"
        print(f"--- Visiting {url} ---")
        await page.goto(url, wait_until="domcontentloaded", timeout=45000)
        
        # Coba klik tombol bahasa jika muncul
        try:
            print("Mencari tombol bahasa...")
            lang_btn = page.get_by_role("button", name="Bahasa Indonesia")
            if await lang_btn.is_visible(timeout=5000):
                print("Klik tombol Bahasa Indonesia!")
                await lang_btn.click()
                await page.wait_for_timeout(3000)
        except Exception as e:
            print("Modal bahasa tidak ditemukan atau gagal diklik:", e)

        await page.wait_for_timeout(5000)

        print("--- JSON-LD ---")
        ld_scripts = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => s.innerText);
        }''')
        for script in ld_scripts:
            print("LD script:", script)

        print("--- Meta tags ---")
        metas = await page.evaluate('''() => {
            return Array.from(document.querySelectorAll('meta')).map(m => m.getAttribute('name') + ' | ' + m.getAttribute('property') + ' : ' + m.getAttribute('content'));
        }''')
        for m in metas:
            if 'price' in str(m).lower() or 'Rp' in str(m) or 'twitter' in str(m).lower() or 'og:' in str(m).lower():
                print(m)

        print("--- Regex matching Rp in Element innerText ---")
        body_text = await page.evaluate('document.body.innerText')
        import re
        matches = re.finditer(r'.{0,20}Rp\s*([\d\.]+).{0,20}', body_text)
        for i, m in enumerate(matches):
            print(f"Match {i}: {m.group(0).strip()}")
            if i > 20:
                print("... truncated")
                break

        print("--- Taking Screenshot ---")
        await page.screenshot(path="debug_shopee.png", full_page=True)
        html = await page.content()
        with open("debug.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("Scraped length:", len(html))
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
