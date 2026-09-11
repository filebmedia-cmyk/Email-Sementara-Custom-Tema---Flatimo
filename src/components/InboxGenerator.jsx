import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  RefreshCw, 
  QrCode, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  Plus, 
  Edit2, 
  Shield, 
  Zap,
  Mail
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function InboxGenerator({
  currentEmail,
  currentUsername,
  currentDomain,
  domains,
  onGenerateNew,
  onCreateCustom,
  onDeleteCurrent,
  onOpenQrModal,
  onRefresh,
  isRefreshing,
  addToast
}) {
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customUser, setCustomUser] = useState(currentUsername);
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const domainDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
        setIsDomainOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsDomainOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = () => {
    if (!currentEmail) return;
    navigator.clipboard.writeText(currentEmail);
    setCopied(true);
    if (addToast) {
      addToast('success', 'Email Berhasil Disalin', currentEmail);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const clean = customUser.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (clean) {
      onCreateCustom(clean, currentDomain);
    }
    setIsEditing(false);
  };

  const handleSelectDomain = (selectedDom) => {
    setIsDomainOpen(false);
    if (selectedDom !== currentDomain) {
      onCreateCustom(currentUsername, selectedDom);
    }
  };

  return (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Generator Card Container with Glow and No Overflow Clipping */}
      <div 
        className="relative rounded-2xl sm:rounded-3xl bg-dark-900/95 border backdrop-blur-xl p-4 sm:p-6 md:p-8 transition-all duration-300"
        style={{
          borderColor: glowEnabled ? `${primaryColor}40` : 'rgba(255, 255, 255, 0.1)',
          boxShadow: glowEnabled ? `0 0 35px ${primaryColor}20` : '0 10px 30px rgba(0,0,0,0.5)'
        }}
      >
        
        {/* Ambient Top Glow Effect */}
        {glowEnabled && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-8 blur-xl pointer-events-none opacity-60 rounded-full"
            style={{
              background: `linear-gradient(to r, ${primaryColor}30, ${secondaryColor}40, ${primaryColor}30)`
            }}
          />
        )}

        {/* --- MAIN GENERATOR CONTAINER --- */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 sm:gap-4">
          
          {/* Email Address Bar */}
          <div 
            className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-dark-950/90 border border-slate-800 transition-all"
            style={{
              borderColor: glowEnabled ? `${primaryColor}30` : 'rgba(255, 255, 255, 0.08)'
            }}
          >
            
            {/* Top Row on Mobile: Shield + Username Input */}
            <div className="flex items-center gap-2 flex-1 min-w-0 px-1 py-0.5">
              {/* Shield Icon */}
              <div 
                className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border shrink-0 group"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}35`,
                  color: primaryColor,
                  boxShadow: glowEnabled ? `0 0 10px ${primaryColor}30` : undefined
                }}
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 icon-pulse" />
              </div>

              {/* Username Input / Custom Edit */}
              <div className="flex-1 min-w-[100px]">
                {isEditing ? (
                  <form onSubmit={handleCustomSubmit} className="flex items-center">
                    <input
                      type="text"
                      value={customUser}
                      onChange={(e) => setCustomUser(e.target.value)}
                      onBlur={handleCustomSubmit}
                      autoFocus
                      placeholder="nama-inbox"
                      className="w-full bg-transparent text-white font-mono font-bold text-sm sm:text-base md:text-lg focus:outline-none border-b pb-0.5"
                      style={{ borderColor: primaryColor }}
                    />
                  </form>
                ) : (
                  <div 
                    onClick={() => {
                      setCustomUser(currentUsername);
                      setIsEditing(true);
                    }}
                    className="cursor-pointer group flex items-center gap-1.5 py-1"
                    title="Klik untuk mengubah username custom"
                  >
                    <span 
                      className="font-mono font-bold text-sm sm:text-base md:text-lg text-white group-hover:opacity-80 transition-colors truncate max-w-[160px] sm:max-w-[200px]"
                    >
                      {currentUsername || 'nama_inbox'}
                    </span>
                    <Edit2 className="w-3 h-3 text-slate-500 icon-interactive group-hover:text-white group-hover:rotate-45 shrink-0" />
                  </div>
                )}
              </div>
            </div>

            {/* Middle on Mobile / Inline on Desktop: @ Separator + Animated Custom Domain Selector */}
            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-2">
              <span className="font-bold text-base select-none pl-1" style={{ color: primaryColor }}>@</span>

              {/* --- CUSTOM ANIMATED DOMAIN DROPDOWN (NO CIRCULAR NETWORK ICON, NO CLIPPING) --- */}
              <div ref={domainDropdownRef} className="relative flex-1 sm:flex-none min-w-[140px] sm:min-w-[165px]">
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDomainOpen(!isDomainOpen)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-dark-900 border text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm active:scale-95 group ${
                    isDomainOpen ? 'shadow-lg' : 'hover:border-slate-600'
                  }`}
                  style={{
                    color: primaryColor,
                    borderColor: isDomainOpen ? primaryColor : `${primaryColor}40`,
                    boxShadow: (isDomainOpen && glowEnabled) ? `0 0 15px ${primaryColor}30` : undefined
                  }}
                >
                  <span className="font-mono truncate">{currentDomain}</span>

                  <ChevronDown 
                    className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ease-out ${
                      isDomainOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                    style={{ color: primaryColor }}
                  />
                </button>

                {/* Animated Floating Menu Popover with High Z-Index & Smooth Scrollbar */}
                {isDomainOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-full min-w-[200px] sm:min-w-[230px] rounded-2xl bg-dark-900 border backdrop-blur-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200"
                    style={{
                      borderColor: glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: glowEnabled ? `0 10px 35px rgba(0,0,0,0.85), 0 0 20px ${primaryColor}25` : '0 10px 35px rgba(0,0,0,0.85)'
                    }}
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                      <span>Pilih Domain Aktif</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-dark-950 text-slate-400 border border-slate-800">
                        {domains.length} Domain
                      </span>
                    </div>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-0.5">
                      {domains.map((dom) => {
                        const isSelected = dom === currentDomain;
                        return (
                          <button
                            key={dom}
                            type="button"
                            onClick={() => handleSelectDomain(dom)}
                            className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs font-semibold font-mono transition-all duration-200 group ${
                              isSelected 
                                ? 'bg-dark-800 text-white shadow-sm' 
                                : 'text-slate-300 hover:text-white hover:bg-dark-800/60 hover:translate-x-1'
                            }`}
                            style={isSelected ? { color: primaryColor } : {}}
                          >
                            <span className="truncate">{dom}</span>

                            {isSelected && (
                              <Check className="w-3.5 h-3.5 shrink-0 stroke-[2.5] animate-in zoom-in" style={{ color: primaryColor }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons (Copy, QR, Refresh) */}
              <div className="flex items-center gap-1 shrink-0 pl-1">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  title="Salin alamat email"
                  className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all group ${
                    copied 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'text-slate-300 hover:bg-dark-900 bg-dark-900/60 border border-slate-800'
                  }`}
                  style={!copied ? { borderColor: `${primaryColor}20` } : {}}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-in zoom-in" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-interactive group-hover:scale-125" />
                  )}
                </button>

                {/* QR Modal */}
                <button
                  onClick={onOpenQrModal}
                  title="Tampilkan QR Code"
                  className="group p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-slate-300 hover:bg-dark-900 bg-dark-900/60 border border-slate-800 transition-all active:scale-95"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-interactive group-hover:rotate-12" />
                </button>
              </div>

            </div>

          </div>

          {/* Action Buttons: Segarkan, Ganti Acak & Hapus Kotak */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Dedicated Refresh Inbox Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Segarkan Kotak Masuk Sekarang"
              className="flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold bg-dark-950/90 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer shadow-sm group"
              style={{
                borderColor: isRefreshing ? primaryColor : undefined,
                boxShadow: (isRefreshing && glowEnabled) ? `0 0 16px ${primaryColor}40` : undefined
              }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} style={{ color: primaryColor }} />
              <span>Segarkan</span>
            </button>

            {/* Generate Random Button */}
            <button
              onClick={onGenerateNew}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black text-dark-950 transition-all duration-300 transform active:scale-95 group shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 25px ${primaryColor}55` : undefined
              }}
            >
              <Zap className="w-4 h-4 text-dark-950 icon-interactive group-hover:scale-125 transition-transform" />
              <span>Ganti Acak</span>
            </button>

            {/* Delete/Purge Button */}
            <button
              onClick={onDeleteCurrent}
              title="Hapus kotak masuk dan bersihkan semua pesan"
              className="group p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-dark-950/80 border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-all duration-200 active:scale-95"
            >
              <Trash2 className="w-4 h-4 icon-shake group-hover:scale-110" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
