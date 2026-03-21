'use client'

import { useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // 1. Fungsi Inisialisasi Widget
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'id',
          includedLanguages: 'en,ms,zh-CN,ja,ar,es',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // 2. Logika Auto-Detection (Hanya berjalan jika belum pernah memilih bahasa)
    const autoDetectLanguage = () => {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      // Jika cookie googtrans belum ada, kita deteksi bahasa browser
      if (!getCookie('googtrans')) {
        const browserLang = navigator.language.split('-')[0]; // Ambil kode utama (misal 'en' dari 'en-US')
        const supported = ['en', 'ms', 'zh', 'ja', 'ar', 'es'];
        
        if (supported.includes(browserLang) && browserLang !== 'id') {
          // Set cookie agar Google Translate otomatis aktif
          // Format: /bahasa_asli/bahasa_tujuan
          const targetLang = browserLang === 'zh' ? 'zh-CN' : browserLang;
          document.cookie = `googtrans=/id/${targetLang}; path=/`;
          document.cookie = `googtrans=/id/${targetLang}; path=/; domain=${window.location.hostname}`;
          
          // Refresh ringan jika diperlukan agar widget membaca cookie baru
          // Namun biasanya inisialisasi script di bawah sudah cukup.
        }
      }
    };

    autoDetectLanguage();

    // 3. Tambahkan script Google Translate
    const addScript = () => {
      if (document.querySelector('#google-translate-script')) return;
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    addScript();

    // 4. "Guardian Script": Hapus Banner Google secara instan saat muncul
    const observer = new MutationObserver(() => {
      const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
      }
      
      // Kembalikan posisi body/html jika Google memaksanya bergeser
      if (document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.documentElement.style.marginTop !== '0px') {
        document.documentElement.style.marginTop = '0px';
      }
    });

    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative group">
      {/* Premium UI Wrapper */}
      <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/60 cursor-pointer">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Globe size={14} className="animate-spin-slow" />
        </div>
        
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-none">Global</span>
          <div id="google_translate_element" className="premium-translate-element"></div>
        </div>

        <ChevronDown size={12} className="text-gray-400 group-hover:text-primary transition-colors" />
      </div>

      <style jsx global>{`
        .premium-translate-element {
          height: 16px;
          overflow: hidden;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-family: inherit !important;
          display: flex !important;
          align-items: center !important;
        }
        .goog-te-gadget-simple span {
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-menu-value img {
          display: none !important;
        }
        .goog-te-menu-value span:nth-child(3) {
          display: none !important;
        }
        .goog-te-menu-value span:nth-child(5) {
          display: none !important;
        }
        @media (max-width: 640px) {
          .premium-translate-element { width: 40px; }
        }
      `}</style>
    </div>
  )
}
