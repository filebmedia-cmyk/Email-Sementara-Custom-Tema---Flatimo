import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Megaphone, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Gift
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function PromoModal({ 
  config, 
  isOpen: forcedIsOpen, 
  onClose: customOnClose, 
  isPreview = false 
}) {
  const { primaryColor, secondaryColor, glowEnabled, fontFamilyId } = useTheme();
  
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isControlled = typeof forcedIsOpen === 'boolean';
  const isVisible = isControlled ? forcedIsOpen : internalIsOpen;

  // Check display rules on load
  useEffect(() => {
    if (isPreview) {
      setInternalIsOpen(true);
      return;
    }

    if (!config || !config.popupEnabled) {
      setInternalIsOpen(false);
      return;
    }

    // Check frequency: 'once_per_session' vs 'always'
    if (config.popupFrequency === 'once_per_session') {
      const seenKey = `flatimo_promo_seen_${config.popupTitle || 'default'}`;
      const hasSeen = sessionStorage.getItem(seenKey);
      if (!hasSeen) {
        // Small delay for smooth entrance after page load
        const timer = setTimeout(() => {
          setInternalIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [config, isPreview]);

  const handleClose = () => {
    if (!isPreview && config && config.popupFrequency === 'once_per_session') {
      const seenKey = `flatimo_promo_seen_${config.popupTitle || 'default'}`;
      sessionStorage.setItem(seenKey, 'true');
    }

    if (customOnClose) {
      customOnClose();
    }
    setInternalIsOpen(false);
  };

  const handleActionClick = () => {
    if (config?.popupButtonUrl) {
      window.open(config.popupButtonUrl, '_blank', 'noopener,noreferrer');
    }
    handleClose();
  };

  if (!isVisible) return null;

  const title = config?.popupTitle || 'Pengumuman Penting';
  const message = config?.popupMessage || 'Selamat datang di Flatimo Mail! Nikmati layanan email sementara super cepat, aman, dan tanpa batas.';
  const imageUrl = config?.popupImageUrl;
  const buttonText = config?.popupButtonText || 'Lihat Selengkapnya';
  const buttonUrl = config?.popupButtonUrl;

  const is8BitFont = fontFamilyId === 'press-start';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Card with Dynamic Neon Glow */}
      <div 
        className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-dark-900 border shadow-2xl overflow-hidden text-slate-100 transition-all duration-300 animate-in zoom-in-95"
        style={{
          borderColor: glowEnabled ? `${primaryColor}60` : 'rgba(255, 255, 255, 0.12)',
          boxShadow: glowEnabled ? `0 0 50px ${primaryColor}35, 0 25px 80px rgba(0,0,0,0.95)` : '0 25px 80px rgba(0,0,0,0.95)'
        }}
      >
        {/* Top Radiant Ambient Aura */}
        {glowEnabled && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-20 blur-3xl pointer-events-none opacity-80"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}50, ${secondaryColor}70, ${primaryColor}50)`
            }}
          />
        )}

        {/* Close Icon Button (Top Right) */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 z-20 p-2 rounded-xl bg-dark-950/80 hover:bg-dark-800 text-slate-400 hover:text-white border border-slate-700/60 hover:border-slate-500 backdrop-blur-sm transition-all active:scale-90 cursor-pointer"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Preview Badge if tested from Settings */}
        {isPreview && (
          <div 
            className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md"
            style={{
              backgroundColor: `${primaryColor}25`,
              color: primaryColor,
              borderColor: `${primaryColor}60`
            }}
          >
            <Sparkles className="w-3 h-3 icon-twinkle" />
            <span>Mode Uji Coba (Preview)</span>
          </div>
        )}

        {/* Image / Banner Container (if provided) */}
        {imageUrl && !imageError && (
          <div className="relative w-full max-h-64 sm:max-h-72 overflow-hidden bg-dark-950 border-b border-slate-800/80 flex items-center justify-center group">
            <img 
              src={imageUrl} 
              alt={title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {/* Subtle Gradient Shadow Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-4">
          
          {/* Header Icon + Title */}
          <div className="flex items-start gap-3.5">
            {!imageUrl && (
              <div 
                className="p-3 rounded-2xl border shrink-0 mt-0.5"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderColor: `${primaryColor}60`,
                  color: primaryColor,
                  boxShadow: glowEnabled ? `0 0 20px ${primaryColor}40` : undefined
                }}
              >
                <Megaphone className="w-6 h-6 icon-twinkle" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h2 
                className={`font-black text-white leading-tight ${is8BitFont ? 'text-xs sm:text-sm tracking-wider' : 'text-lg sm:text-xl'}`}
                style={glowEnabled ? { textShadow: `0 0 15px ${primaryColor}50` } : {}}
              >
                {title}
              </h2>
            </div>
          </div>

          {/* Message Body with preserved line breaks */}
          <div 
            className={`text-slate-300 leading-relaxed whitespace-pre-line ${is8BitFont ? 'text-[10px] leading-5' : 'text-xs sm:text-sm'}`}
          >
            {message}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            
            <button
              onClick={handleClose}
              className={`px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white bg-dark-950/80 hover:bg-dark-800 border border-slate-800 hover:border-slate-700 transition-all active:scale-95 cursor-pointer text-center ${is8BitFont ? 'text-[10px]' : 'text-xs sm:text-sm'}`}
            >
              Tutup
            </button>

            {buttonUrl && (
              <button
                onClick={handleActionClick}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-dark-950 transition-all active:scale-95 shadow-lg cursor-pointer ${is8BitFont ? 'text-[10px]' : 'text-xs sm:text-sm'}`}
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
                }}
              >
                <span>{buttonText}</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}