import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { verifyPassword } from '../utils/api';

export default function PasswordGate({ onUnlocked }) {
  const { siteTitle, siteTagline, primaryColor, secondaryColor, glowEnabled } = useTheme();
  
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setErrorMessage('Silakan masukkan kata sandi akses.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyPassword(passwordInput);
      if (res.success && res.authorized) {
        localStorage.setItem('tmail_access_token', res.token || 'auth_granted');
        onUnlocked();
      } else {
        setErrorMessage(res.error || 'Kata sandi akses salah!');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat memverifikasi sandi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-dark-950 text-slate-100">
      
      {/* Dynamic Radiant Ambient Glow Background */}
      {glowEnabled && (
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl opacity-30 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor}, transparent)`
          }}
        />
      )}

      {/* Password Gate Card */}
      <div 
        className="relative w-full max-w-md rounded-3xl bg-dark-900/95 border backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 transition-all duration-300"
        style={{
          borderColor: glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.12)',
          boxShadow: glowEnabled ? `0 0 40px ${primaryColor}25, 0 20px 60px rgba(0,0,0,0.85)` : '0 20px 60px rgba(0,0,0,0.85)'
        }}
      >
        {/* Top Icon & Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: glowEnabled ? `0 0 25px ${primaryColor}60` : undefined
              }}
            >
              <Lock className="w-8 h-8 text-dark-950 stroke-[2.5]" />
            </div>

            <div 
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-dark-950 border border-slate-700"
              style={{ color: primaryColor }}
            >
              <Sparkles className="w-3.5 h-3.5 icon-twinkle" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {siteTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Akses website dilindungi oleh kata sandi keamanan.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>Masukkan Kata Sandi Akses:</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Ketik kata sandi..."
                disabled={isLoading}
                autoFocus
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-dark-950 border text-white text-sm font-semibold focus:outline-none transition-all placeholder:text-slate-600"
                style={{
                  borderColor: errorMessage ? '#EF4444' : glowEnabled ? `${primaryColor}40` : 'rgba(255, 255, 255, 0.15)',
                  boxShadow: errorMessage ? '0 0 12px rgba(239, 68, 68, 0.3)' : undefined
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                title={showPassword ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 icon-interactive" />
                ) : (
                  <Eye className="w-4 h-4 icon-interactive" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-black text-dark-950 transition-all duration-200 active:scale-95 shadow-lg group"
            style={{
              backgroundColor: primaryColor,
              boxShadow: glowEnabled ? `0 0 25px ${primaryColor}60` : undefined
            }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Buka Kunci Akses</span>
                <ArrowRight className="w-4 h-4 icon-interactive group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5" style={{ color: primaryColor }} />
            <span>Sistem Keamanan Akses Flatimo Mail v1.0 VIP</span>
          </div>
        </div>

      </div>

    </div>
  );
}
