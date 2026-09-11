import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Key, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  ShieldAlert, 
  Webhook, 
  Copy, 
  Check, 
  RefreshCw, 
  Save, 
  Eye, 
  EyeOff, 
  Send, 
  Clock, 
  AlertCircle, 
  Bot, 
  Globe,
  Megaphone,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchSettings, updateSettings, verifySettingsPin } from '../utils/api';
import PromoModal from './PromoModal';

export default function SettingsView({ addToast, onSettingsUpdated }) {
  const { primaryColor, glowEnabled } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Settings PIN Gate State
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('tmail_settings_unlocked') === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState('');

  // Settings Configuration State
  const [apiKey, setApiKey] = useState('FLATIMOSTORE');
  const [apiMode, setApiMode] = useState('public'); // 'public' | 'private'
  const [webhookMode, setWebhookMode] = useState('public'); // 'public' | 'private'
  const [httpDocsMode, setHttpDocsMode] = useState('public'); // 'public' | 'private'
  const [isPasswordProtected, setIsPasswordProtected] = useState(false); // Default OFF as requested
  const [accessPassword, setAccessPassword] = useState('flatimo_access_pass');
  const [settingsPassword, setSettingsPassword] = useState('2103'); // Default 2103
  const [showPassword, setShowPassword] = useState(false);
  const [showSettingsPin, setShowSettingsPin] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('flatimo_secret_key_123');
  const [retentionHours, setRetentionHours] = useState(24);

  // Pop-up Notification & Promo State
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupImageUrl, setPopupImageUrl] = useState('');
  const [popupButtonText, setPopupButtonText] = useState('Lihat Selengkapnya');
  const [popupButtonUrl, setPopupButtonUrl] = useState('');
  const [popupFrequency, setPopupFrequency] = useState('once_per_session'); // 'once_per_session' | 'always'
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load current settings from backend
  useEffect(() => {
    async function load() {
      try {
        const res = await fetchSettings();
        if (res.success && res.settings) {
          const s = res.settings;
          setApiKey(s.apiKey || 'FLATIMOSTORE');
          setApiMode(s.apiMode || 'public');
          setWebhookMode(s.webhookMode || 'public');
          setHttpDocsMode(s.httpDocsMode || 'public');
          setIsPasswordProtected(Boolean(s.isPasswordProtected));
          setAccessPassword(s.accessPassword || 'flatimo_access_pass');
          setSettingsPassword(s.settingsPassword || s.adminBotPassword || '2103');
          setWebhookSecret(s.webhookSecret || 'flatimo_secret_key_123');
          setRetentionHours(s.retentionHours || 24);
          setPopupEnabled(Boolean(s.popupEnabled));
          setPopupTitle(s.popupTitle || '');
          setPopupMessage(s.popupMessage || '');
          setPopupImageUrl(s.popupImageUrl || '');
          setPopupButtonText(s.popupButtonText || 'Lihat Selengkapnya');
          setPopupButtonUrl(s.popupButtonUrl || '');
          setPopupFrequency(s.popupFrequency || 'once_per_session');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Verify PIN for Settings Lock Gate
  const handleVerifyPin = async (e) => {
    if (e) e.preventDefault();
    const cleanPin = pinInput.trim();
    if (!cleanPin) {
      setPinError('Masukkan PIN Pengaturan.');
      return;
    }

    setIsVerifyingPin(true);
    setPinError('');

    try {
      const res = await verifySettingsPin(cleanPin);
      if (res.success && res.authorized) {
        sessionStorage.setItem('tmail_settings_unlocked', 'true');
        setIsUnlocked(true);
        setPinInput('');
        if (addToast) {
          addToast('success', 'Akses Pengaturan Terbuka', 'Selamat datang di panel kontrol Pengaturan Sistem.');
        }
      } else {
        setPinError(res.error || 'PIN Pengaturan salah! Silakan coba lagi.');
      }
    } catch (err) {
      // Fallback check
      if (cleanPin === '2103' || cleanPin === settingsPassword) {
        sessionStorage.setItem('tmail_settings_unlocked', 'true');
        setIsUnlocked(true);
        setPinInput('');
        if (addToast) {
          addToast('success', 'Akses Pengaturan Terbuka', 'Selamat datang di panel kontrol Pengaturan Sistem.');
        }
      } else {
        setPinError('PIN Pengaturan salah! Silakan coba lagi.');
      }
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Lock Settings Back
  const handleLockSettings = () => {
    sessionStorage.removeItem('tmail_settings_unlocked');
    setIsUnlocked(false);
    setPinInput('');
    setPinError('');
    if (addToast) {
      addToast('info', 'Pengaturan Dikunci', 'Panel pengaturan telah dikunci kembali.');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const payload = {
        apiKey: apiKey.trim(),
        apiMode,
        webhookMode,
        httpDocsMode,
        isPasswordProtected,
        accessPassword: accessPassword.trim(),
        settingsPassword: settingsPassword.trim() || '2103',
        adminBotPassword: settingsPassword.trim() || '2103',
        webhookSecret: webhookSecret.trim(),
        retentionHours: Number(retentionHours) || 24,
        popupEnabled: Boolean(popupEnabled),
        popupTitle: popupTitle.trim(),
        popupMessage: popupMessage.trim(),
        popupImageUrl: popupImageUrl.trim(),
        popupButtonText: popupButtonText.trim() || 'Lihat Selengkapnya',
        popupButtonUrl: popupButtonUrl.trim(),
        popupFrequency
      };

      const res = await updateSettings(payload);
      if (res.success) {
        if (onSettingsUpdated) {
          onSettingsUpdated(payload);
        }
        if (addToast) {
          addToast('success', 'Pengaturan Berhasil Disimpan', 'Konfigurasi sistem, pop-up notifikasi, dan keamanan telah diperbarui.');
        }
      } else {
        if (addToast) {
          addToast('error', 'Gagal Menyimpan', res.error || 'Terjadi kesalahan saat menyimpan pengaturan.');
        }
      }
    } catch (err) {
      if (addToast) {
        addToast('error', 'Gagal Menyimpan', 'Terjadi kesalahan jaringan.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Random Key
  const handleGenerateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rand = 'KEY_';
    for (let i = 0; i < 16; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setApiKey(rand);
  };

  // Copy helpers
  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/v1/webhook/incoming` 
    : 'https://mailflatimo.web.id/api/v1/webhook/incoming';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Trigger test webhook ping
  const handleTestWebhookPing = async () => {
    try {
      const res = await fetch('/api/v1/webhook/incoming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret
        },
        body: JSON.stringify({
          to: 'webhook-test@mailflatimo.web.id',
          from: { name: 'Flatimo Webhook Tester', address: 'ping@flatimo.me' },
          subject: 'Uji Coba Ping Inbound Webhook Berhasil',
          text: 'Halo! Ini adalah notifikasi pengujian otomatis dari Inbound Webhook Flatimo Mail.'
        })
      });
      const data = await res.json();
      if (data.success) {
        if (addToast) addToast('success', 'Webhook Ping Berhasil', 'Payload webhook berhasil diproses oleh sistem.');
      } else {
        if (addToast) addToast('error', 'Webhook Ditolak', data.error || 'Gagal mengirim payload webhook.');
      }
    } catch (err) {
      if (addToast) addToast('error', 'Webhook Error', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  // --- VIEW 1: PIN LOCK GATE (JIKA BELUM DIBUKA) ---
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div 
          className="relative rounded-3xl bg-dark-900 border p-6 sm:p-8 space-y-6 text-center shadow-2xl transition-all"
          style={{
            borderColor: glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.1)',
            boxShadow: glowEnabled ? `0 0 35px ${primaryColor}25` : undefined
          }}
        >
          {/* Icon Badge */}
          <div className="flex justify-center">
            <div 
              className="p-4 rounded-3xl border relative"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}60`,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 25px ${primaryColor}40` : undefined
              }}
            >
              <Lock className="w-8 h-8 icon-twinkle" />
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Akses Pengaturan Terkunci
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Masukkan PIN Admin Pengaturan untuk mengelola API Key, Webhook, dan keamanan sistem.
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <input
                type={showPinInput ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError('');
                }}
                placeholder="Masukkan PIN Admin"
                autoFocus
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-dark-950 border border-slate-800 text-center text-white text-base font-mono font-bold tracking-widest focus:outline-none focus:border-white transition-colors"
                style={{
                  borderColor: pinError ? '#ef4444' : undefined
                }}
              />
              <button
                type="button"
                onClick={() => setShowPinInput(!showPinInput)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                title={showPinInput ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPinInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingPin}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-sm font-black text-dark-950 transition-all active:scale-95 shadow-lg cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
              }}
            >
              {isVerifyingPin ? (
                <div className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Pengaturan</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- VIEW 2: FULL SETTINGS PANEL (JIKA SUDAH DIBUKA) ---
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Header Banner */}
      <div 
        className="relative rounded-2xl sm:rounded-3xl bg-dark-900 border p-5 sm:p-7 overflow-hidden transition-all duration-300"
        style={{
          borderColor: glowEnabled ? `${primaryColor}40` : 'rgba(255, 255, 255, 0.1)',
          boxShadow: glowEnabled ? `0 0 30px ${primaryColor}20` : undefined
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div 
              className="p-3 rounded-2xl border shrink-0"
              style={{
                backgroundColor: `${primaryColor}20`,
                borderColor: `${primaryColor}60`,
                color: primaryColor,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}40` : undefined
              }}
            >
              <SlidersHorizontal className="w-6 h-6 icon-interactive" />
            </div>

            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Pusat Pengaturan Sistem</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Kelola mode Publik / Privat untuk REST API, Inbound Webhook, HTTP Docs, PIN Pengaturan, dan kunci sandi web.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Lock Again Button */}
            <button
              onClick={handleLockSettings}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-dark-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Kunci kembali menu pengaturan"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Kunci Menu</span>
            </button>

            {/* Save Settings Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-dark-950 transition-all active:scale-95 shadow-lg cursor-pointer"
              style={{
                backgroundColor: primaryColor,
                boxShadow: glowEnabled ? `0 0 20px ${primaryColor}60` : undefined
              }}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* --- CARD 1: MODE REST API & ENDPOINT (PUBLIK / PRIVAT) --- */}
        <div 
          className="rounded-2xl bg-dark-900 border p-5 sm:p-6 space-y-4 transition-all"
          style={{
            borderColor: apiMode === 'private' && glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: apiMode === 'private' && glowEnabled ? `0 0 20px ${primaryColor}20` : undefined
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: apiMode === 'private' ? `${primaryColor}20` : '#161722',
                  borderColor: apiMode === 'private' ? `${primaryColor}50` : '#2d2e3e',
                  color: apiMode === 'private' ? primaryColor : '#94a3b8'
                }}
              >
                {apiMode === 'private' ? <Lock className="w-5 h-5 icon-twinkle" /> : <Globe className="w-5 h-5 icon-interactive" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Keamanan REST API & Endpoint
                </h2>
                <p className="text-xs text-slate-400">
                  Mode akses publik bebas atau privat ber-API Key.
                </p>
              </div>
            </div>

            {/* Toggle Switch Button */}
            <button
              onClick={() => setApiMode(apiMode === 'public' ? 'private' : 'public')}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all border active:scale-95 cursor-pointer"
              style={{
                backgroundColor: apiMode === 'private' ? `${primaryColor}25` : '#11121a',
                color: apiMode === 'private' ? primaryColor : '#64748b',
                borderColor: apiMode === 'private' ? `${primaryColor}60` : '#334155',
                boxShadow: apiMode === 'private' && glowEnabled ? `0 0 14px ${primaryColor}40` : undefined
              }}
            >
              {apiMode === 'private' ? 'MODE: PRIVAT' : 'MODE: PUBLIK'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs leading-relaxed">
            {apiMode === 'private' ? (
              <span className="text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span>
                  <b>Mode Privat Aktif</b>: Seluruh endpoint REST API di luar browser wajib menyertakan header <code>X-API-Key</code> atau parameter <code>?api_key=</code>.
                </span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <b>Mode Publik Aktif</b>: Siapapun dapat mengambil data domain, kotak masuk, dan pesan dari REST API tanpa wajib menyertakan API Key.
                </span>
              </span>
            )}
          </div>

          {/* Master API Key Form */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>Master API Key:</span>
              </label>

              <button
                onClick={handleGenerateKey}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 icon-interactive" />
                <span>Generate Acak</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-white transition-colors"
              />

              <button
                onClick={handleCopyKey}
                className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Salin API Key"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Gunakan header <code>X-API-Key: {apiKey}</code> untuk integrasi bot atau script luar.
            </p>
          </div>
        </div>

        {/* --- CARD 2: MODE INBOUND WEBHOOK (PUBLIK / PRIVAT) --- */}
        <div 
          className="rounded-2xl bg-dark-900 border p-5 sm:p-6 space-y-4 transition-all"
          style={{
            borderColor: webhookMode === 'private' && glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: webhookMode === 'private' && glowEnabled ? `0 0 20px ${primaryColor}20` : undefined
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: webhookMode === 'private' ? `${primaryColor}20` : '#161722',
                  borderColor: webhookMode === 'private' ? `${primaryColor}50` : '#2d2e3e',
                  color: webhookMode === 'private' ? primaryColor : '#94a3b8'
                }}
              >
                {webhookMode === 'private' ? <Lock className="w-5 h-5 icon-twinkle" /> : <Webhook className="w-5 h-5 icon-interactive" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Keamanan Inbound Webhook
                </h2>
                <p className="text-xs text-slate-400">
                  Mode penerimaan forward email masuk via HTTP POST.
                </p>
              </div>
            </div>

            {/* Toggle Switch Button */}
            <button
              onClick={() => setWebhookMode(webhookMode === 'public' ? 'private' : 'public')}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all border active:scale-95 cursor-pointer"
              style={{
                backgroundColor: webhookMode === 'private' ? `${primaryColor}25` : '#11121a',
                color: webhookMode === 'private' ? primaryColor : '#64748b',
                borderColor: webhookMode === 'private' ? `${primaryColor}60` : '#334155',
                boxShadow: webhookMode === 'private' && glowEnabled ? `0 0 14px ${primaryColor}40` : undefined
              }}
            >
              {webhookMode === 'private' ? 'WEBHOOK: PRIVAT' : 'WEBHOOK: PUBLIK'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs leading-relaxed">
            {webhookMode === 'private' ? (
              <span className="text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span>
                  <b>Webhook Privat</b>: Cloudflare Worker atau pengirim webhook wajib menyertakan header <code>X-Webhook-Secret</code> yang sesuai.
                </span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <b>Webhook Publik</b>: Webhook menerima forward email dari worker atau server SMTP luar tanpa verifikasi secret key.
                </span>
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  URL Webhook Masuk (POST):
                </label>
                <button
                  onClick={handleTestWebhookPing}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Test Ping</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-slate-300 font-mono text-[11px] focus:outline-none"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="p-2 rounded-xl bg-dark-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Salin URL"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                Webhook Secret Key (Autentikasi):
              </label>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Secret key untuk webhook..."
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* --- CARD 3: VISIBILITAS TAB DOKUMENTASI HTTP / API (PUBLIK / PRIVAT) --- */}
        <div 
          className="rounded-2xl bg-dark-900 border p-5 sm:p-6 space-y-4 transition-all"
          style={{
            borderColor: glowEnabled ? `${primaryColor}30` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: glowEnabled ? `0 0 20px ${primaryColor}15` : undefined
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderColor: `${primaryColor}50`,
                  color: primaryColor
                }}
              >
                {httpDocsMode === 'public' ? <Eye className="w-5 h-5 icon-twinkle" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Visibilitas Tab HTTP / Dokumentasi API
                </h2>
                <p className="text-xs text-slate-400">
                  Tampilkan atau sembunyikan menu API di navbar website.
                </p>
              </div>
            </div>

            {/* Toggle Switch Button */}
            <button
              onClick={() => setHttpDocsMode(httpDocsMode === 'public' ? 'private' : 'public')}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all border active:scale-95 cursor-pointer"
              style={{
                backgroundColor: httpDocsMode === 'public' ? `${primaryColor}25` : '#11121a',
                color: httpDocsMode === 'public' ? primaryColor : '#64748b',
                borderColor: httpDocsMode === 'public' ? `${primaryColor}60` : '#334155',
                boxShadow: httpDocsMode === 'public' && glowEnabled ? `0 0 14px ${primaryColor}40` : undefined
              }}
            >
              {httpDocsMode === 'public' ? 'HTTP DOCS: PUBLIK' : 'HTTP DOCS: PRIVAT'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs leading-relaxed">
            {httpDocsMode === 'public' ? (
              <span className="text-slate-300 flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <b>Publik (Ditampilkan)</b>: Tab menu <b>API Publik</b> tampil di bilah navigasi atas (Navbar) dan mobile untuk semua pengunjung.
                </span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-start gap-2">
                <EyeOff className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                <span>
                  <b>Privat (Disembunyikan)</b>: Tab menu <b>API Publik</b> disembunyikan dari bilah navigasi utama website agar tampilan lebih bersih dan rahasia.
                </span>
              </span>
            )}
          </div>
        </div>

        {/* --- CARD 4: KUNCI SANDI AKSES WEBSITE (ON / OFF) --- */}
        <div 
          className="rounded-2xl bg-dark-900 border p-5 sm:p-6 space-y-4 transition-all"
          style={{
            borderColor: isPasswordProtected && glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: isPasswordProtected && glowEnabled ? `0 0 20px ${primaryColor}20` : undefined
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: isPasswordProtected ? `${primaryColor}20` : '#161722',
                  borderColor: isPasswordProtected ? `${primaryColor}50` : '#2d2e3e',
                  color: isPasswordProtected ? primaryColor : '#94a3b8'
                }}
              >
                {isPasswordProtected ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Kunci Sandi Akses Website
                </h2>
                <p className="text-xs text-slate-400">
                  Proteksi seluruh website dengan sandi sebelum dibuka.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <button
              onClick={() => setIsPasswordProtected(!isPasswordProtected)}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all border active:scale-95 cursor-pointer"
              style={{
                backgroundColor: isPasswordProtected ? `${primaryColor}25` : '#11121a',
                color: isPasswordProtected ? primaryColor : '#64748b',
                borderColor: isPasswordProtected ? `${primaryColor}60` : '#334155',
                boxShadow: isPasswordProtected && glowEnabled ? `0 0 14px ${primaryColor}40` : undefined
              }}
            >
              {isPasswordProtected ? 'KUNCI: ON' : 'KUNCI: OFF'}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs leading-relaxed">
            {isPasswordProtected ? (
              <span className="text-amber-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <span>
                  <b>Website Terkunci (ON)</b>: Pengunjung baru wajib memasukkan kata sandi pada Layar Kunci sebelum dapat menggunakan layanan email.
                </span>
              </span>
            ) : (
              <span className="text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>
                  <b>Website Terbuka Bebas (OFF)</b>: Seluruh pengunjung dapat langsung menggunakan website tanpa dimintai kata sandi.
                </span>
              </span>
            )}
          </div>

          {/* Custom Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>Kata Sandi Akses Website:</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                placeholder="Tentukan kata sandi baru..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs font-mono font-semibold focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title={showPassword ? "Sembunyikan" : "Tampilkan"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* --- CARD 5: PIN AKSES PENGATURAN & ADMIN BOT --- */}
        <div 
          className="rounded-2xl bg-dark-900 border p-5 sm:p-6 space-y-4 transition-all"
          style={{
            borderColor: glowEnabled ? `${primaryColor}40` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: glowEnabled ? `0 0 20px ${primaryColor}20` : undefined
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl border shrink-0"
                style={{
                  backgroundColor: `${primaryColor}20`,
                  borderColor: `${primaryColor}50`,
                  color: primaryColor
                }}
              >
                <Bot className="w-5 h-5 icon-twinkle" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  PIN Pengaturan & Admin Bot
                </h2>
                <p className="text-xs text-slate-400">
                  PIN untuk membuka menu ini & panel bot Telegram.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span>
              PIN ini digunakan untuk membuka <b>Menu Pengaturan</b> di web dan membuka <b>Panel Admin Bot Telegram</b> (<code>/admin</code>). Anda dapat mengubahnya kapan saja di sini.
            </span>
          </div>

          {/* Custom Settings PIN Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span>PIN / Password Pengaturan & Admin:</span>
            </label>

            <div className="relative">
              <input
                type={showSettingsPin ? 'text' : 'password'}
                value={settingsPassword}
                onChange={(e) => setSettingsPassword(e.target.value)}
                placeholder="Contoh: 2103"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSettingsPin(!showSettingsPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                title={showSettingsPin ? "Sembunyikan" : "Tampilkan"}
              >
                {showSettingsPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* --- CARD 7: POP-UP NOTIFIKASI, PENGUMUMAN & PROMOSI (PROMO MODAL) --- */}
        <div 
          className="lg:col-span-2 rounded-2xl bg-dark-900 border p-5 sm:p-7 space-y-6 transition-all"
          style={{
            borderColor: popupEnabled && glowEnabled ? `${primaryColor}50` : 'rgba(255, 255, 255, 0.08)',
            boxShadow: popupEnabled && glowEnabled ? `0 0 25px ${primaryColor}20` : undefined
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-2xl border shrink-0"
                style={{
                  backgroundColor: popupEnabled ? `${primaryColor}20` : '#161722',
                  borderColor: popupEnabled ? `${primaryColor}60` : '#2d2e3e',
                  color: popupEnabled ? primaryColor : '#94a3b8',
                  boxShadow: popupEnabled && glowEnabled ? `0 0 16px ${primaryColor}40` : undefined
                }}
              >
                <Megaphone className="w-6 h-6 icon-twinkle" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">
                    Pop-up Notifikasi, Pengumuman & Promosi
                  </h2>
                  <span 
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: popupEnabled ? `${primaryColor}20` : '#11121a',
                      color: popupEnabled ? primaryColor : '#64748b',
                      borderColor: popupEnabled ? `${primaryColor}50` : '#334155'
                    }}
                  >
                    {popupEnabled ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tampilkan modal pop-up interaktif (custom teks, foto/banner, tautan aksi, dan sinkronisasi font pixel) saat pengunjung membuka web.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Live Preview Button */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-dark-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                title="Lihat preview pop-up sekarang"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Uji Coba Tampilan</span>
              </button>

              {/* Master ON/OFF Switch */}
              <button
                type="button"
                onClick={() => setPopupEnabled(!popupEnabled)}
                className="px-4 py-2 rounded-xl text-xs font-black transition-all border active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: popupEnabled ? `${primaryColor}25` : '#11121a',
                  color: popupEnabled ? primaryColor : '#64748b',
                  borderColor: popupEnabled ? `${primaryColor}60` : '#334155',
                  boxShadow: popupEnabled && glowEnabled ? `0 0 16px ${primaryColor}50` : undefined
                }}
              >
                {popupEnabled ? 'POP-UP: ON' : 'POP-UP: OFF'}
              </button>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-800/80">
            
            {/* Left Column: Title & Message */}
            <div className="space-y-4">
              
              {/* Popup Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Judul Pop-up:</span>
                </label>
                <input
                  type="text"
                  value={popupTitle}
                  onChange={(e) => setPopupTitle(e.target.value)}
                  placeholder="Contoh: ⚡ DISKON 50% & UPDATE FITUR TERBARU"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Popup Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Pesan / Deskripsi Pengumuman:</span>
                </label>
                <textarea
                  rows={4}
                  value={popupMessage}
                  onChange={(e) => setPopupMessage(e.target.value)}
                  placeholder="Tuliskan pesan lengkap, pengumuman promo, atau informasi penting untuk pengunjung website..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              {/* Display Frequency */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>Frekuensi Tampil ke Pengunjung:</span>
                </label>
                <select
                  value={popupFrequency}
                  onChange={(e) => setPopupFrequency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-white transition-colors"
                >
                  <option value="once_per_session">Sekali per Sesi Browser (Disarankan - Nyaman & Rapi)</option>
                  <option value="always">Setiap Buka / Refresh Halaman (Selalu Muncul)</option>
                </select>
              </div>

            </div>

            {/* Right Column: Image Banner, CTA Buttons & Image Live Preview */}
            <div className="space-y-4">
              
              {/* Image URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  <span>URL Banner / Foto Gambar (Opsional):</span>
                </label>
                <input
                  type="url"
                  value={popupImageUrl}
                  onChange={(e) => setPopupImageUrl(e.target.value)}
                  placeholder="Contoh: https://example.com/banner-promo.jpg (Kosongkan jika teks saja)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Mini Image Preview Thumbnail if valid */}
              {popupImageUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-dark-950 max-h-28 flex items-center justify-center">
                  <img 
                    src={popupImageUrl} 
                    alt="Preview Thumbnail" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover max-h-28"
                  />
                  <div className="absolute bottom-1 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-slate-300 backdrop-blur-sm">
                    Live Banner Preview
                  </div>
                </div>
              )}

              {/* Action Button Label & Link URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Teks Tombol Aksi:</span>
                  </label>
                  <input
                    type="text"
                    value={popupButtonText}
                    onChange={(e) => setPopupButtonText(e.target.value)}
                    placeholder="Contoh: Buka Promo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                    <span>Tautan Link Tombol (Opsional):</span>
                  </label>
                  <input
                    type="url"
                    value={popupButtonUrl}
                    onChange={(e) => setPopupButtonUrl(e.target.value)}
                    placeholder="Contoh: https://t.me/yourchannel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <span>
                  Tipografi font pop-up akan otomatis menyesuaikan dengan <b>Font Website</b> yang dipilih (termasuk font <b>Pixelify Sans</b> atau <b>Press Start 2P</b>).
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Live Preview Modal for Admin */}
      <PromoModal
        config={{
          popupEnabled: true,
          popupTitle: popupTitle || 'Contoh Judul Pengumuman',
          popupMessage: popupMessage || 'Ini adalah contoh isi pesan pop-up promosi / pengumuman yang akan dilihat oleh pengunjung website.',
          popupImageUrl: popupImageUrl,
          popupButtonText: popupButtonText || 'Lihat Selengkapnya',
          popupButtonUrl: popupButtonUrl || (popupButtonText ? 'https://mailflatimo.web.id' : ''),
          popupFrequency: 'always'
        }}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isPreview={true}
      />

    </div>
  );
}

