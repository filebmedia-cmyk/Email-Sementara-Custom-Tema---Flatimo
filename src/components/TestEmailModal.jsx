import React, { useState } from 'react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { sendTestEmail } from '../utils/api';
import { useTheme } from '../context/ThemeContext';

export default function TestEmailModal({ 
  targetEmail,
  currentEmail, 
  isOpen, 
  onClose,
  onSuccess,
  addToast
}) {
  const activeEmail = targetEmail || currentEmail || '';
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();
  const [preset, setPreset] = useState('google');
  const [senderName, setSenderName] = useState('Google Security');
  const [senderEmail, setSenderEmail] = useState('no-reply@accounts.google.com');
  const [subject, setSubject] = useState('Kode Verifikasi Keamanan Google Anda: 894021');
  const [withAttachment, setWithAttachment] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (type) => {
    setPreset(type);
    if (type === 'google') {
      setSenderName('Google Verification Team');
      setSenderEmail('no-reply@accounts.google.com');
      setSubject('Kode Verifikasi Akun Google Anda: ' + Math.floor(100000 + Math.random() * 900000));
    } else if (type === 'tiktok') {
      setSenderName('TikTok Security');
      setSenderEmail('register@tiktok.com');
      setSubject('[TikTok] Verifikasi Pendaftaran Akun Baru');
    } else if (type === 'invoice') {
      setSenderName('Billing & Payments');
      setSenderEmail('billing@flatimo.me');
      setSubject('Konfirmasi Transaksi Pembayaran Berhasil #INV-' + Math.floor(1000 + Math.random() * 9000));
      setWithAttachment(true);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await sendTestEmail({
        to: activeEmail,
        senderName,
        senderEmail,
        subject,
        withAttachment
      });

      setSuccess(true);
      if (addToast) {
        addToast('success', 'Email Simulasi Terkirim', `Email berhasil dikirim ke ${activeEmail}`);
      }
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      if (addToast) {
        addToast('error', 'Gagal Mengirim', err.message);
      } else {
        alert('Gagal mengirim email simulasi: ' + err.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-dark-900 border shadow-2xl p-6 sm:p-8"
        style={{
          borderColor: glowEnabled ? `${primaryColor}50` : `${primaryColor}40`,
          boxShadow: glowEnabled ? `0 0 35px ${primaryColor}30` : `0 0 20px ${primaryColor}20`
        }}
      >
        
        {/* Close */}
        <button
          onClick={onClose}
          className="group absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-dark-950 border border-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4 icon-interactive group-hover:rotate-90" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2" style={{ color: primaryColor }}>
          <Sparkles className="w-5 h-5 icon-twinkle" />
          <h3 className="font-black text-lg text-white">Simulasi Tes Email Masuk</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Uji coba kecepatan penerimaan email secara instan ke inbox <strong className="font-mono" style={{ color: primaryColor }}>{activeEmail}</strong>.
        </p>

        {/* Presets */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-2">Pilih Template Email:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handlePresetSelect('google')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                preset === 'google'
                  ? 'bg-dark-800 text-white shadow-md'
                  : 'bg-dark-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              style={preset === 'google' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Google OTP
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('tiktok')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                preset === 'tiktok'
                  ? 'bg-dark-800 text-white shadow-md'
                  : 'bg-dark-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              style={preset === 'tiktok' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              TikTok Verif
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('invoice')}
              className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                preset === 'invoice'
                  ? 'bg-dark-800 text-white shadow-md'
                  : 'bg-dark-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              style={preset === 'invoice' ? { borderColor: primaryColor, color: primaryColor } : {}}
            >
              Invoice File
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-400 mb-1">Nama Pengirim:</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-white font-medium focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Email Pengirim:</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-white font-mono focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 mb-1">Subjek Email:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-800 text-white font-medium focus:outline-none"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending || success}
              className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-dark-950 shadow-md active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
              }}
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-dark-950 animate-in zoom-in" />
                  <span>Email Terkirim & Masuk!</span>
                </>
              ) : isSending ? (
                <span>Sedang Mengirim...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 icon-interactive group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  <span>Kirim Email Percobaan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
