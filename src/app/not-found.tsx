import Link from 'next/link'
import { Home, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '6s' }} />

      <div className="z-10 text-center max-w-2xl w-full bg-white/80 backdrop-blur-2xl p-8 sm:p-14 rounded-[3rem] shadow-premium border border-white relative mt-16 sm:mt-0">
        
        {/* Floating icon */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-primary to-orange-400 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-primary/40 transition-transform hover:rotate-0 duration-500 cursor-pointer">
          <AlertTriangle size={56} className="text-white -rotate-12 hover:rotate-0 transition-transform duration-500" />
        </div>

        <h1 className="text-[6rem] sm:text-[10rem] font-black leading-none bg-gradient-to-br from-gray-900 to-gray-500 bg-clip-text text-transparent mt-8 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mt-2 mb-6 tracking-tight">
          SALAH LINK KAU TU WLEK! 😜
        </h2>
        
        <p className="text-base sm:text-lg text-gray-500 mb-10 font-medium leading-relaxed">
          Makanya kalau copas URL diliat-liat lagi dong. Halaman yang kamu tuju tuh nggak ada atau emang belum dibikin sama adminnya!
        </p>

        <Link 
          href="/" 
          className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/20 hover:shadow-primary/30 group"
        >
          <Home size={22} className="group-hover:-translate-y-1 transition-transform" />
          <span>Kembali ke Jalan yang Benar</span>
        </Link>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute top-32 right-1/4 w-6 h-6 rounded-full bg-primary/40 animate-bounce" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-32 left-1/4 w-10 h-10 rounded-full bg-orange-400/30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }} />
      <div className="absolute top-1/2 right-10 w-4 h-4 rounded-full bg-gray-900/20 animate-pulse" />
    </div>
  )
}
