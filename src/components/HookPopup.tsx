'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'

interface HookPopupProps {
  popup: any
  onCTA?: () => void
  onClose?: () => void
}

export default function HookPopup({ popup, onCTA, onClose }: HookPopupProps) {
  const [show, setShow] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (!popup || !popup.is_active || hasShown) return

    const handleTrigger = () => {
      if (hasShown) return
      setShow(true)
      setHasShown(true)
      if (popup.show_once) {
        localStorage.setItem(`popup_shown_${popup.id}`, 'true')
      }
    }

    // Check localStorage
    if (popup.show_once && localStorage.getItem(`popup_shown_${popup.id}`)) {
      setHasShown(true)
      return
    }

    if (!popup.trigger_type || popup.trigger_type === 'immediate') {
      handleTrigger()
      return
    }

    if (popup.trigger_type === 'delay') {
      const timer = setTimeout(handleTrigger, (popup.trigger_value || 5) * 1000)
      return () => clearTimeout(timer)
    }

    if (popup.trigger_type === 'scroll') {
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        if (scrollPercent >= (popup.trigger_value || 50)) {
          handleTrigger()
          window.removeEventListener('scroll', handleScroll)
        }
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }

    if (popup.trigger_type === 'click') {
      let clicks = 0
      const handleClick = () => {
        clicks++
        if (clicks >= (popup.trigger_value || 3)) {
          handleTrigger()
          window.removeEventListener('click', handleClick)
        }
      }
      window.addEventListener('click', handleClick)
      return () => window.removeEventListener('click', handleClick)
    }
  }, [popup, hasShown])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => {
              setShow(false)
              if (onClose) onClose()
            }}
          />
          <div 
            className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setShow(false)
                if (onClose) onClose()
              }}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-gray-900 transition-colors z-10"
            >
              <X size={20} />
            </button>

        {popup.popup_images && popup.popup_images.length > 0 && (
          <div className="w-full bg-gray-50 border-b border-gray-100">
            {popup.popup_images.length === 1 ? (
              <div className="aspect-video w-full overflow-hidden">
                <img src={popup.popup_images[0].image_url} alt="" className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1 p-1">
                {popup.popup_images.slice(0, 4).map((img: any, i: number) => (
                  <div key={i} className={`overflow-hidden ${popup.popup_images.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                    <img src={img.image_url} alt="" className="object-cover w-full h-full hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-8 text-center">
          <h2 className="text-2xl font-black text-gray-900 mb-2">{popup.title}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">{popup.description}</p>
          
          <button 
            onClick={() => {
              setShow(false)
              if (onCTA) onCTA()
            }}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/20"
          >
            <span>{popup.cta_text || 'Lihat Detail'}</span>
            <ExternalLink size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
