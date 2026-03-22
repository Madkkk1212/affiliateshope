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

    // 2. Auto-Detection Removed per user request

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

    </div>
  )
}
