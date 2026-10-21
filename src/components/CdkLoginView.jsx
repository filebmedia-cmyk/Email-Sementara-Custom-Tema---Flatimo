import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Lock, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { verifyCdk } from '../utils/api';

export default function CdkLoginView({ onUnlocked, onBackHome, addToast }) {
  const { primaryColor, secondaryColor, glowEnabled, siteTitle } = useTheme();
  const [cdkInput, setCdkInput] = useState('');
  const [showCdk, setShowCdk] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
        sessionStorage.setItem('tmail_admin_cdk', clean);
        localStorage.setItem('tmail_admin_cdk', clean);
        sessionStorage.setItem('tmail_settings_unlocked', 'true');
        
        if (addToast) {
          addToast('success', 'Akses Admin Terbuka ⚡', 'Selamat datang Admin di panel kontrol.');
        }

        onUnlocked(clean);
      } else {
        setErrorMessage(res.error || 'Kode CDK Tidak Valid! Akses Ditolak.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan saat verifikasi CDK.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-20">
      
      {/* Background Ambient Radial Glow */}
      {glowEnabled && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl opacity-25 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor}, transparent)`
          }}
        />
      )}

      {/* Main CDK Login Card */}
      <div 
        className="relative w-full max-w-md rounded-3xl bg-dark-900/95 border backdrop-blur-2xl p-6 sm:p-9 shadow-2xl space-y-6 transition-all duration-300"
        style={{
          borderColor: glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.12)',
          boxShadow: glowEnabled ? `0 0 45px ${primaryColor}25, 0 20px 60px rgba(0,0,0,0.85)` : '0 20px 60px rgba(0,0,0,0.85)'
        }}
      >
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl transition-transform duration-300 transform hover:scale-105"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: primaryColor,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 25px ${primaryColor}50` : undefined
              }}
            >
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div 
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-dark-950 border border-slate-700"
              style={{ color: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5 icon-twinkle" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Panel Admin
              </h1>
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
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Halaman ini terkunci rapat dari publik. Masukkan kode <b>CDK Lisensi</b> Anda untuk mengakses panel.
            </p>
          </div>
        </div>

        {/* CDK Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <input
                type={showCdk ? "text" : "password"}
                value={cdkInput}
                onChange={(e) => {
                  setCdkInput(e.target.value.toUpperCase());
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Masukkan Kode CDK..."
                autoFocus
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-dark-950 border text-center text-white text-sm font-mono font-bold tracking-wider placeholder:text-slate-600 focus:outline-none transition-colors uppercase"
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
              <div className="mt-2.5 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-center gap-1.5 text-center font-medium">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
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

        {/* Back to Home Button */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Kotak Masuk</span>
          </button>
        </div>
      </div>
    </div>
  );
}
