import React from 'react';
import { 
  Zap, 
  Palette, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Terminal, 
  Layers, 
  Send,
  BookOpen,
  SlidersHorizontal,
  Mail
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Header({
  activeTab,
  setActiveTab,
  soundEnabled,
  setSoundEnabled,
  httpDocsMode = 'public',
  onOpenTestModal,
  onOpenThemeModal
}) {
  const { siteTitle, siteTagline, primaryColor, secondaryColor, glowEnabled } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-dark-950/85 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('inbox')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            {/* Animated Logo Icon with Pulse and Glow */}
            <div 
              className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl transition-all duration-300 transform group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}55` : undefined
              }}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-dark-950 fill-dark-950 icon-interactive group-hover:rotate-12" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-xl md:text-2xl text-white tracking-tight leading-none group-hover:opacity-90 transition-opacity">
                  {siteTitle}
                </span>

                {/* Badge Version */}
                <span 
                  className="group/badge inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    borderColor: `${primaryColor}40`,
                    color: primaryColor,
                    boxShadow: glowEnabled ? `0 0 8px ${primaryColor}30` : undefined
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5 icon-twinkle" />
                  <span>v1.0 VIP</span>
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-400 font-medium hidden xs:block truncate max-w-[200px] sm:max-w-none mt-0.5">
                {siteTagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-dark-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'inbox'
                  ? 'text-dark-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
              style={activeTab === 'inbox' ? {
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 15px ${primaryColor}45` : undefined
              } : {}}
            >
              <Zap className="w-4 h-4 icon-interactive group-hover:rotate-12" />
              <span>Kotak Masuk</span>
            </button>

            {httpDocsMode !== 'private' && (
              <button
                onClick={() => setActiveTab('api')}
                className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'api'
                    ? 'text-dark-950 font-bold shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-dark-800'
                }`}
                style={activeTab === 'api' ? {
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  boxShadow: glowEnabled ? `0 0 15px ${primaryColor}45` : undefined
                } : {}}
              >
                <BookOpen className="w-4 h-4 icon-interactive group-hover:scale-115" />
                <span>API Publik</span>
              </button>
            )}

            {/* Replaced DNS Guide with Settings Tab */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'text-dark-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
              style={activeTab === 'settings' ? {
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 15px ${primaryColor}45` : undefined
              } : {}}
            >
              <SlidersHorizontal className="w-4 h-4 icon-interactive group-hover:rotate-180 transition-transform duration-500" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Theme Settings Trigger Button with Radiant Neon Glow */}
            <button
              onClick={onOpenThemeModal}
              title="Kustomisasi Tema & Tampilan"
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 duration-200"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}50`,
                boxShadow: glowEnabled ? `0 0 15px ${primaryColor}35` : undefined
              }}
            >
              <Palette className="w-3.5 h-3.5 icon-twinkle group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline">Tema & Desain</span>
            </button>

            {/* Quick Test Email Sender Button */}
            <button
              onClick={onOpenTestModal}
              title="Kirim email simulasi untuk uji coba instan"
              className="group flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-slate-300 bg-dark-900 border border-slate-700 hover:bg-dark-800 hover:text-white transition-all active:scale-95 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 icon-interactive group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">Tes Email</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Suara Notifikasi Aktif" : "Suara Notifikasi Nonaktif"}
              className="group p-2 sm:p-2.5 rounded-xl bg-dark-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all active:scale-95"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 icon-shake" style={{ color: primaryColor }} />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500 icon-interactive group-hover:rotate-12" />
              )}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inbox'
                ? 'text-dark-950 font-bold shadow-sm'
                : 'text-slate-400'
            }`}
            style={activeTab === 'inbox' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 10px ${primaryColor}40` : undefined
            } : {}}
          >
            <Zap className="w-3.5 h-3.5 icon-interactive" />
            <span>Kotak Masuk</span>
          </button>

          {httpDocsMode !== 'private' && (
            <button
              onClick={() => setActiveTab('api')}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'api'
                  ? 'text-dark-950 font-bold shadow-sm'
                  : 'text-slate-400'
              }`}
              style={activeTab === 'api' ? { 
                backgroundColor: primaryColor,
                boxShadow: glowEnabled ? `0 0 10px ${primaryColor}40` : undefined
              } : {}}
            >
              <BookOpen className="w-3.5 h-3.5 icon-interactive" />
              <span>API Publik</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'text-dark-950 font-bold shadow-sm'
                : 'text-slate-400'
            }`}
            style={activeTab === 'settings' ? { 
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 10px ${primaryColor}40` : undefined
            } : {}}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 icon-interactive" />
            <span>Pengaturan</span>
          </button>
        </div>

      </div>
    </header>
  );
}
