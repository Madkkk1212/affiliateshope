'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Star } from 'lucide-react'

interface HookPopupProps {
  popup: any
  onShow?: () => void
  onCTA?: () => void
  onClose?: () => void
}

export default function HookPopup({ popup, onShow, onCTA, onClose }: HookPopupProps) {
  const [show, setShow] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [lsChecked, setLsChecked] = useState<string>('SSR')

  useEffect(() => {
    if (popup?.id) {
      setLsChecked(String(localStorage.getItem(`popup_shown_${popup?.id}`)))
    }
  }, [popup?.id])

  useEffect(() => {
    if (show && popup.auto_close && popup.auto_close_time > 0) {
      setTimeLeft(popup.auto_close_time)
      const interval = setInterval(() => {
        setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [show, popup.auto_close, popup.auto_close_time])

  useEffect(() => {
    if (timeLeft === 0) {
      setShow(false)
      if (onClose) onClose()
    }
  }, [timeLeft, onClose])

  const is_active = popup?.is_active
  const trigger_type = popup?.trigger_type
  const trigger_value = popup?.trigger_value
  const show_once = popup?.show_once
  const popup_id = popup?.id

  useEffect(() => {
    if (is_active === false || hasShown) return

    const handleTrigger = () => {
      if (hasShown) return
      setShow(true)
      setHasShown(true)
      if (onShow) onShow()
      if (show_once && popup_id) {
        localStorage.setItem(`popup_shown_${popup_id}`, 'true')
      }
    }

    // Check localStorage
    if (show_once && popup_id && localStorage.getItem(`popup_shown_${popup_id}`)) {
      setHasShown(true)
      return
    }

    if (!trigger_type || trigger_type === 'immediate') {
      handleTrigger()
      return
    }

    if (trigger_type === 'delay') {
      const val = typeof trigger_value === 'number' ? trigger_value : 5
      const timer = setTimeout(handleTrigger, val * 1000)
      return () => clearTimeout(timer)
    }

    if (trigger_type === 'scroll') {
      const handleScroll = () => {
        const docH = document.documentElement.scrollHeight
        const winH = window.innerHeight
        if (docH <= winH) {
          handleTrigger()
          return
        }
        const scrollPercent = (window.scrollY / (docH - winH)) * 100
        const val = typeof trigger_value === 'number' ? trigger_value : 50
        if (scrollPercent >= val) {
          handleTrigger()
          window.removeEventListener('scroll', handleScroll)
        }
      }
      handleScroll()
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }

    if (trigger_type === 'click') {
      let clicks = 0
      const val = typeof trigger_value === 'number' ? trigger_value : 3
      const handleClick = () => {
        clicks++
        if (clicks >= val) {
          handleTrigger()
          window.removeEventListener('click', handleClick)
        }
      }
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [is_active, trigger_type, trigger_value, show_once, popup_id, hasShown, onShow])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-500 ease-out">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0"
        onClick={() => {
          setShow(false)
          if (onClose) onClose()
        }}
      />
      
      {/* Popup Container */}
      <div 
        className="bg-white w-full max-w-[28rem] rounded-[24px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-400 ease-out transform transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1) inset' }}
      >
        {/* Close Button */}
        <button 
          onClick={() => {
            setShow(false)
            if (onClose) onClose()
          }}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all z-20 hover:scale-110 hover:rotate-90 duration-300"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Image Section */}
        {popup.popup_images && popup.popup_images.length > 0 && (
          <div className="w-full relative bg-gray-50 group">
            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Best Choice
            </div>
            
            {popup.popup_images.length === 1 ? (
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img 
                  src={popup.popup_images[0].image_url} 
                  alt={popup.title} 
                  className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0.5 relative">
                {popup.popup_images.slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className={`overflow-hidden relative ${popup.popup_images.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                    <img 
                      src={img.image_url} 
                      alt="" 
                      className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110" 
                    />
                  </div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center bg-white relative">
          <div className="flex items-center gap-1 text-orange-400 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            <span className="text-xs font-bold text-gray-400 ml-1">(5.0)</span>
          </div>
          
          <h2 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 mb-3 leading-tight tracking-tight">
            {popup.title}
          </h2>
          
          <p className="text-sm sm:text-[15px] text-gray-500 mb-8 leading-relaxed max-w-[90%]">
            {popup.description}
          </p>
          
          {/* CTA Button */}
          <button 
            onClick={() => {
              setShow(false)
              if (onCTA) onCTA()
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-base sm:text-lg"
          >
            <span>{popup.cta_text || 'Lihat Detail'}</span>
            <ExternalLink size={20} strokeWidth={2.5} />
          </button>
          
          {popup.auto_close && timeLeft !== null && timeLeft > 0 && (
            <p className="absolute bottom-3 text-[10px] text-gray-300 font-bold tracking-wide">
              Menutup otomatis dalam {timeLeft}s
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
