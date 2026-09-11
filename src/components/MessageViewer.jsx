import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Trash2, 
  Download, 
  FileText, 
  Code, 
  Paperclip, 
  Printer, 
  Clock, 
  User, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MessageViewer({
  message,
  onBack,
  onClose,
  onDelete,
  onOpenTestModal,
  addToast,
  isLoading = false
}) {
  const { primaryColor, secondaryColor, glowEnabled, siteTitle } = useTheme();
  const [viewTab, setViewTab] = useState('html'); // 'html', 'text', 'headers', 'attachments'
  const iframeRef = useRef(null);

  const handleClose = onBack || onClose;

  useEffect(() => {
    if (viewTab === 'html' && iframeRef.current && message?.html) {
      const iframe = iframeRef.current;
      const handleResize = () => {
        try {
          if (iframe.contentWindow?.document?.body) {
            const height = iframe.contentWindow.document.body.scrollHeight;
            iframe.style.height = `${Math.max(height + 40, 300)}px`;
          }
        } catch {
          // Cross-origin fallback
        }
      };

      iframe.onload = handleResize;
    }
  }, [viewTab, message]);

  if (isLoading) {
    return (
      <div 
        className="w-full rounded-2xl sm:rounded-3xl bg-dark-900 border p-8 sm:p-12 text-center transition-all"
        style={{
          borderColor: glowEnabled ? `${primaryColor}40` : 'rgba(255, 255, 255, 0.1)',
          boxShadow: glowEnabled ? `0 0 25px ${primaryColor}15` : undefined
        }}
      >
        <div 
          className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
        />
        <p className="text-xs sm:text-sm text-slate-300 font-bold">Membuka detail isi pesan...</p>
      </div>
    );
  }

  // --- EMPTY STATE PLACEHOLDER KETIKA BELUM ADA PESAN DIPILIH ---
  if (!message) {
    return (
      <div 
        className="w-full rounded-2xl sm:rounded-3xl bg-dark-900 border p-6 sm:p-8 md:p-10 text-center transition-all space-y-6 shadow-xl relative overflow-hidden"
        style={{
          borderColor: glowEnabled ? `${primaryColor}35` : 'rgba(255, 255, 255, 0.08)',
          boxShadow: glowEnabled ? `0 0 30px ${primaryColor}15` : undefined
        }}
      >
        {/* Ambient Top Glow */}
        {glowEnabled && (
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-12 blur-2xl pointer-events-none opacity-40 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}40, ${secondaryColor}60, ${primaryColor}40)`
            }}
          />
        )}

        {/* Center Animated Badge Icon */}
        <div className="flex justify-center pt-2">
          <div className="relative">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-transform duration-300 transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                border: `1.5px solid ${primaryColor}50`,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 25px ${primaryColor}35` : undefined
              }}
            >
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 icon-float" />
            </div>

            <div 
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-dark-950 border"
              style={{ borderColor: `${primaryColor}60`, color: primaryColor }}
            >
              <ShieldCheck className="w-4 h-4 icon-pulse" />
            </div>
          </div>
        </div>

        {/* Title & Explanation */}
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-base sm:text-xl font-black text-white">
            Panel Pembaca Pesan Masuk
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Pilih salah satu email di kotak masuk sebelah kiri untuk membaca pesan secara lengkap, mengunduh file lampiran, atau melihat kode verifikasi OTP.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto text-left pt-2">
          <div 
            className="p-3 rounded-xl bg-dark-950 border text-xs"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <span className="font-bold block text-white" style={{ color: primaryColor }}>⚡ Real-time SSE</span>
            <span className="text-[11px] text-slate-400">Pesan langsung tampil seketika</span>
          </div>

          <div 
            className="p-3 rounded-xl bg-dark-950 border text-xs"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <span className="font-bold block text-white" style={{ color: primaryColor }}>🔑 Auto OTP Extract</span>
            <span className="text-[11px] text-slate-400">Deteksi 4-8 digit kode OTP</span>
          </div>

          <div 
            className="p-3 rounded-xl bg-dark-950 border text-xs"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <span className="font-bold block text-white" style={{ color: primaryColor }}>📄 HTML & EML Asli</span>
            <span className="text-[11px] text-slate-400">Render grafis email lengkap</span>
          </div>

          <div 
            className="p-3 rounded-xl bg-dark-950 border text-xs"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <span className="font-bold block text-white" style={{ color: primaryColor }}>📎 Lampiran File</span>
            <span className="text-[11px] text-slate-400">Unduh dokumen & foto masuk</span>
          </div>
        </div>
      </div>
    );
  }

  const senderDisplay = message.from?.name ? `"${message.from.name}" <${message.from.address}>` : (message.from?.address || message.from?.text || 'Pengirim');
  const dateFormatted = new Date(message.date).toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const attachments = message.attachments || [];

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-6 px-1 sm:px-0 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div 
        className="rounded-2xl sm:rounded-3xl bg-dark-900 border shadow-xl overflow-hidden backdrop-blur-xl"
        style={{
          borderColor: `${primaryColor}30`,
          boxShadow: `0 0 25px ${primaryColor}15`
        }}
      >
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-dark-950/60">
          <button
            onClick={handleClose}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl bg-dark-850 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            style={{
              borderColor: `${primaryColor}30`
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-interactive group-hover:-translate-x-1" />
            <span>Tutup Pesan</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Download EML */}
            <a
              href={`/api/v1/messages/${message.id}/raw`}
              download={`mail-${message.id}.eml`}
              title="Unduh file mentah (.eml)"
              className="group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-dark-850 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5 icon-interactive group-hover:translate-y-0.5" />
              <span className="hidden xs:inline">EML</span>
            </a>

            {/* Print */}
            <button
              onClick={() => window.print()}
              title="Cetak pesan"
              className="group p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-dark-850 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 text-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5 icon-interactive group-hover:rotate-12" />
            </button>

            {/* Delete Message */}
            <button
              onClick={() => onDelete(message.id)}
              title="Hapus pesan ini"
              className="group flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 icon-wobble" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Header Details */}
        <div className="p-4 sm:p-7 md:p-8 border-b border-slate-800/80 bg-gradient-to-b from-dark-900 to-dark-950/40">
          
          <h1 className="text-lg sm:text-2xl font-black text-white mb-3 sm:mb-4 leading-snug break-words">
            {message.subject || '(Tanpa Subjek)'}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Sender */}
            <div className="flex items-start gap-2.5">
              <div 
                className="p-1.5 rounded-lg shrink-0 mt-0.5 border group"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}30`,
                  color: primaryColor
                }}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-pulse" />
              </div>
              <div className="min-w-0">
                <span className="text-slate-500 block font-medium text-[11px]">Dari:</span>
                <span className="font-semibold text-slate-200 font-mono break-all text-xs">
                  {senderDisplay}
                </span>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-2.5 sm:justify-end">
              <div 
                className="p-1.5 rounded-lg shrink-0 mt-0.5 border group"
                style={{
                  backgroundColor: `${secondaryColor}15`,
                  borderColor: `${secondaryColor}30`,
                  color: secondaryColor
                }}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 icon-interactive group-hover:rotate-45" />
              </div>
              <div>
                <span className="text-slate-500 block font-medium text-[11px]">Waktu:</span>
                <span className="font-semibold text-slate-300 text-xs">
                  {dateFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Recipient Tag */}
          <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px]">Tujuan:</span>
            <span 
              className="font-mono font-semibold px-2.5 py-0.5 rounded-md border text-xs break-all"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}30`,
                color: primaryColor
              }}
            >
              {message.inboxEmail}
            </span>
          </div>

        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 pt-3 sm:pt-4 border-b border-slate-800 bg-dark-950/40 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setViewTab('html')}
            className={`group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap shrink-0 transition-all ${
              viewTab === 'html'
                ? 'text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={viewTab === 'html' ? { borderBottomColor: primaryColor, color: primaryColor } : {}}
          >
            <FileText className="w-3.5 h-3.5 icon-interactive group-hover:scale-115" />
            <span>Format HTML</span>
          </button>

          <button
            onClick={() => setViewTab('text')}
            className={`group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap shrink-0 transition-all ${
              viewTab === 'text'
                ? 'text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={viewTab === 'text' ? { borderBottomColor: primaryColor, color: primaryColor } : {}}
          >
            <Code className="w-3.5 h-3.5 icon-interactive group-hover:scale-115" />
            <span>Teks Biasa</span>
          </button>

          {attachments.length > 0 && (
            <button
              onClick={() => setViewTab('attachments')}
              className={`group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap shrink-0 transition-all ${
                viewTab === 'attachments'
                  ? 'text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              style={viewTab === 'attachments' ? { borderBottomColor: primaryColor, color: primaryColor } : {}}
            >
              <Paperclip className="w-3.5 h-3.5 icon-interactive group-hover:rotate-12" />
              <span>Lampiran ({attachments.length})</span>
            </button>
          )}

          <button
            onClick={() => setViewTab('headers')}
            className={`group flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold border-b-2 whitespace-nowrap shrink-0 transition-all ${
              viewTab === 'headers'
                ? 'text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            style={viewTab === 'headers' ? { borderBottomColor: primaryColor, color: primaryColor } : {}}
          >
            <span>Header Teknis</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3.5 sm:p-6">
          
          {/* HTML VIEW */}
          {viewTab === 'html' && (
            <div>
              {message.html ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 overflow-x-auto border border-slate-700 shadow-inner -webkit-overflow-scrolling-touch">
                  <iframe
                    ref={iframeRef}
                    title="Email HTML Body"
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <meta charset="utf-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <style>
                            body {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                              color: #1e293b;
                              margin: 0;
                              padding: 8px;
                              word-wrap: break-word;
                              font-size: 14px;
                            }
                            img { max-width: 100%; height: auto; }
                            a { color: ${primaryColor}; }
                          </style>
                        </head>
                        <body>
                          ${message.html}
                        </body>
                      </html>
                    `}
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                    className="w-full min-h-[300px] border-0"
                  />
                </div>
              ) : (
                <div className="p-5 sm:p-8 rounded-xl sm:rounded-2xl bg-dark-950 border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {message.text || '(Tidak ada konten teks)'}
                </div>
              )}
            </div>
          )}

          {/* TEXT VIEW */}
          {viewTab === 'text' && (
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-950 border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm whitespace-pre-wrap leading-relaxed select-text">
              {message.text || message.textAsHtml || '(Tidak ada konten teks biasa)'}
            </div>
          )}

          {/* ATTACHMENTS VIEW */}
          {viewTab === 'attachments' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-dark-950 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div 
                      className="p-2 rounded-lg sm:rounded-xl shrink-0 border"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: `${primaryColor}30`,
                        color: primaryColor
                      }}
                    >
                      <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 icon-interactive group-hover:rotate-12" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-xs sm:text-sm text-white block truncate">
                        {att.filename}
                      </span>
                      <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                        {(att.size / 1024).toFixed(1)} KB · {att.contentType}
                      </span>
                    </div>
                  </div>

                  <a
                    href={`/api/v1/messages/${message.id}/attachments/${att.id}`}
                    download={att.filename}
                    className="p-2 rounded-lg sm:rounded-xl text-dark-950 font-bold transition-all shrink-0 ml-2 shadow-sm group-hover:scale-105"
                    style={{
                      backgroundColor: primaryColor
                    }}
                    title="Unduh lampiran ini"
                  >
                    <Download className="w-4 h-4 icon-interactive group-hover:translate-y-0.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* HEADERS VIEW */}
          {viewTab === 'headers' && (
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-dark-950 border border-slate-800 overflow-x-auto">
              <pre className="font-mono text-[11px] sm:text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(message.headers, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
