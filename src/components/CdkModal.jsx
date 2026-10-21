import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Check, X, Sparkles, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { verifyCdk } from '../utils/api';

export default function CdkModal({ isOpen, onClose, onUnlocked, addToast }) {
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();
  const [cdkInput, setCdkInput] = useState('');
  const [showCdk, setShowCdk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const clean = cdkInput.trim().toUpperCase();
    if (!clean) {
      setErrorMessage('Silakan masukkan Kode CDK Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyCdk(clean);
      if (res.success && res.authorized) {
        // Save exclusively on admin's browser
        sessionStorage.setItem('tmail_admin_cdk', clean);
        localStorage.setItem('tmail_admin_cdk', clean);
        sessionStorage.setItem('tmail_settings_unlocked', 'true');
        
        if (addToast) {
          addToast('success', 'Akses CDK Berhasil ⚡', 'Selamat datang Admin! Menu Pengaturan Sistem telah dibuka.');
        }

        onUnlocked(clean);
        onClose();
      } else {
        setErrorMessage(res.error || 'Kode CDK Salah atau Tidak Dikenali!');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan saat verifikasi CDK.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl bg-dark-900 border p-6 sm:p-8 shadow-2xl space-y-5 transition-all"
        style={{
          borderColor: glowEnabled ? `${primaryColor}60` : 'rgba(255, 255, 255, 0.15)',
          boxShadow: glowEnabled ? `0 0 35px ${primaryColor}30, 0 20px 50px rgba(0,0,0,0.9)` : undefined
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex relative">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: primaryColor,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}50` : undefined
              }}
            >
              <KeyRound className="w-7 h-7 icon-twinkle" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>Akses Khusus CDK</span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  borderColor: `${primaryColor}40`,
                  color: primaryColor
                }}
              >
                1 User
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Halaman admin terkunci rapat dari publik. Masukkan kode <b>CDK Eksklusif</b> untuk membuka panel kontrol.
            </p>
          </div>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showCdk ? "text" : "password"}
                value={cdkInput}
                onChange={(e) => {
                  setCdkInput(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Masukkan Kode CDK..."
                autoFocus
                className="w-full pl-4 pr-11 py-3 rounded-2xl bg-dark-950 border text-center text-white text-sm font-mono font-bold tracking-wider placeholder:text-slate-600 focus:outline-none transition-colors uppercase"
                style={{
                  borderColor: errorMessage ? '#ef4444' : `${primaryColor}40`
                }}
              />
              <button
                type="button"
                onClick={() => setShowCdk(!showCdk)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                title={showCdk ? "Sembunyikan CDK" : "Tampilkan CDK"}
              >
                {showCdk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errorMessage && (
              <p className="text-xs text-red-400 mt-2 flex items-center justify-center gap-1 text-center font-medium">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !cdkInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs font-black text-dark-950 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg"
            style={{
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Buka Panel Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-1 border-t border-slate-800/60">
          <p className="text-[11px] text-slate-500">
            Hanya pemilik sah kode CDK yang dapat mengakses halaman ini.
          </p>
        </div>
      </div>
    </div>
  );
}
