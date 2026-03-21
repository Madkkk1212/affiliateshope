import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

async def main():
    print("=" * 50)
    print("Membuka browser Shopee... Silakan Login secara manual!")
    print("=" * 50)
    
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(
            user_data_dir="./shopee_profile",
            headless=False, # Harus false agar user bisa melihat dan login
            viewport={"width": 1280, "height": 720},
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        page = context.pages[0]
        await Stealth().apply_stealth_async(page)
        
        print(">>> Membuka halaman login Shopee...")
        await page.goto("https://shopee.co.id/buyer/login")
        
        print(">>> Jika sudah berhasil login dan melihat beranda Shopee, SILAKAN TUTUP BROWSER (X).")
        try:
            await page.wait_for_event("close", timeout=0)
        except Exception as e:
            pass
            
        print(">>> Selesai! Sesi login telah disimpan ke dalam folder 'shopee_profile'.")

if __name__ == "__main__":
    asyncio.run(main())
