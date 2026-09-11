import React from 'react';
import { Mail, Paperclip, Clock, Trash2, ArrowRight, Sparkles, Inbox as InboxIcon, KeyRound, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MessageList({
  messages = [],
  onSelectMessage,
  onDeleteMessage,
  onOpenTestModal,
  onRefresh,
  isRefreshing = false,
  selectedId = null,
  selectedMessageId = null,
  currentEmail = ''
}) {
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState('');

  const activeSelectedId = selectedId || selectedMessageId;

  const filteredMessages = messages.filter(m => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const subject = (m.subject || '').toLowerCase();
    const fromName = (m.from?.name || m.from?.address || m.from?.text || '').toLowerCase();
    const snippet = (m.snippet || '').toLowerCase();
    const otp = (m.otp || '').toLowerCase();
    return subject.includes(term) || fromName.includes(term) || snippet.includes(term) || otp.includes(term);
  });

  const unreadCount = messages.filter(m => !m.read).length;

  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);

      if (diffSec < 60) return 'Baru saja';
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      if (diffHr < 24) return `${diffHr} jam lalu`;

      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', ' +
             date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full">
      <div 
        className="rounded-2xl sm:rounded-3xl bg-dark-900 border overflow-hidden shadow-2xl backdrop-blur-xl transition-all"
        style={{
          borderColor: glowEnabled ? `${primaryColor}35` : 'rgba(255, 255, 255, 0.08)',
          boxShadow: glowEnabled ? `0 0 30px ${primaryColor}15` : undefined
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-800 bg-dark-950/70">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div 
              className="p-2 rounded-xl border group shrink-0"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}40`,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 10px ${primaryColor}30` : undefined
              }}
            >
              <InboxIcon className="w-4 h-4 icon-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                <span>Kotak Masuk</span>
                {unreadCount > 0 && (
                  <span 
                    className="text-[10px] font-black px-2 py-0.5 rounded-full border text-dark-950"
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                      boxShadow: glowEnabled ? `0 0 10px ${primaryColor}60` : undefined
                    }}
                  >
                    {unreadCount} Baru
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-dark-950 border border-slate-800 text-slate-300">
              {messages.length} Pesan
            </span>

            {/* Prominent Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Segarkan / Refresh Kotak Masuk Sekarang"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border active:scale-95 cursor-pointer shadow-sm group"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}40`,
                boxShadow: glowEnabled ? `0 0 12px ${primaryColor}25` : undefined
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        {/* Search / Filter bar if messages exist */}
        {messages.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 border-b border-slate-800/80 bg-dark-950/40">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pengirim, subjek, atau kode OTP..."
              className="w-full px-3.5 py-1.5 rounded-xl bg-dark-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>
        )}

        {/* Content Area: Empty State or Message List */}
        {messages.length === 0 ? (
          <div className="py-12 sm:py-20 px-4 sm:px-6 text-center flex flex-col items-center justify-center">
            
            {/* Animated Pulse Container */}
            <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 mb-4 sm:mb-6">
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />
              <div 
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-dark-950 border shadow-md"
                style={{
                  borderColor: `${primaryColor}40`,
                  color: primaryColor,
                  boxShadow: glowEnabled ? `0 0 20px ${primaryColor}40` : undefined
                }}
              >
                <Mail className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.5] icon-float" />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">
              Belum Ada Email Masuk
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 sm:mb-6 leading-relaxed">
              Email baru akan muncul secara instan di sini berkat koneksi <strong style={{ color: primaryColor }}>Priority 1 Real-time SSE</strong>.
            </p>

            <button
              onClick={onOpenTestModal}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-dark-950 shadow-md active:scale-95 transition-all cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}50` : undefined
              }}
            >
              <Sparkles className="w-4 h-4 icon-twinkle group-hover:rotate-45 transition-transform duration-300" />
              <span>Kirim Email Percobaan Sekarang</span>
            </button>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 text-xs">
            Tidak ada email yang cocok dengan pencarian "{searchTerm}".
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredMessages.map((msg) => {
              const isSelected = activeSelectedId === msg.id;
              const senderDisplay = msg.from.name || msg.from.address || msg.from.text || 'Pengirim';
              const initial = senderDisplay.charAt(0).toUpperCase();

              return (
                <div
                  key={msg.id}
                  onClick={() => onSelectMessage(msg)}
                  className={`group relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 cursor-pointer transition-all duration-200 active:bg-dark-800/80 ${
                    isSelected
                      ? 'bg-dark-850/95 border-l-4'
                      : 'hover:bg-dark-850/70'
                  }`}
                  style={isSelected ? { 
                    borderLeftColor: primaryColor,
                    backgroundColor: `${primaryColor}10`
                  } : {}}
                >
                  {/* Sender Avatar */}
                  <div className="relative shrink-0 mt-0.5">
                    <div 
                      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-dark-800 to-dark-950 border font-bold text-sm sm:text-base shadow-sm transition-transform duration-300 group-hover:scale-105"
                      style={{
                        borderColor: `${primaryColor}30`,
                        color: primaryColor
                      }}
                    >
                      {initial}
                    </div>
                    {!msg.read && (
                      <span 
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-900 animate-pulse"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
                  </div>

                  {/* Message Content Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-xs sm:text-sm truncate ${!msg.read ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                          {senderDisplay}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono hidden md:inline truncate max-w-[200px]">
                          &lt;{msg.from.address || msg.from.text}&gt;
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {/* OTP Badge if extracted */}
                        {msg.otp && (
                          <span 
                            title={`Kode Verifikasi OTP: ${msg.otp}`}
                            className="group/otp flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border text-dark-950 shadow-sm transition-transform hover:scale-105"
                            style={{
                              backgroundColor: primaryColor,
                              borderColor: primaryColor,
                              boxShadow: glowEnabled ? `0 0 10px ${primaryColor}50` : undefined
                            }}
                          >
                            <KeyRound className="w-3 h-3 icon-pulse" />
                            <span>OTP: {msg.otp}</span>
                          </span>
                        )}

                        {msg.hasAttachments && (
                          <span 
                            title={`${msg.attachmentCount} lampiran file`}
                            className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md border transition-transform hover:scale-105"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                              borderColor: `${primaryColor}30`,
                              color: primaryColor
                            }}
                          >
                            <Paperclip className="w-3 h-3 icon-interactive" />
                            <span>{msg.attachmentCount}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-500">
                          <Clock className="w-3 h-3 icon-interactive group-hover:rotate-45" />
                          {formatTime(msg.date)}
                        </span>

                        {/* Delete single button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMessage(msg.id);
                          }}
                          title="Hapus pesan ini"
                          className="sm:opacity-0 group-hover:opacity-100 p-1 sm:p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 icon-wobble" />
                        </button>
                      </div>
                    </div>

                    <h4 
                      className={`text-xs sm:text-sm mb-1 truncate ${!msg.read ? 'font-bold' : 'font-medium text-slate-200'}`}
                      style={!msg.read ? { color: primaryColor } : {}}
                    >
                      {msg.subject || '(Tanpa Subjek)'}
                    </h4>

                    <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1">
                      {msg.snippet || 'Klik untuk membuka isi pesan...'}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="hidden sm:flex items-center self-center text-slate-600 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4 icon-interactive group-hover:translate-x-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
