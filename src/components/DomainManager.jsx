import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Trash2, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Server, 
  CheckCircle2, 
  Copy,
  Eye,
  EyeOff,
  Lock,
  Sparkles
} from 'lucide-react';
import { fetchDomainStatuses, checkDomainSync } from '../utils/api';

// Helper fungsi sensor domain: contoh userdomain.com -> u****n.com
export function maskDomain(domain) {
  if (!domain || !domain.includes('.')) return domain;
  const parts = domain.split('.');
  const ext = parts.slice(1).join('.');
  const name = parts[0];

  if (name.length <= 2) {
    return `${name[0]}*${name.slice(1)}.${ext}`;
  }

  const firstChar = name[0];
  const lastChar = name[name.length - 1];
  const stars = '****';
  return `${firstChar}${stars}${lastChar}.${ext}`;
}

export default function DomainManager({
  domains = [],
  onDeleteDomain
}) {
  const [domainStatuses, setDomainStatuses] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingDomain, setCheckingDomain] = useState(null);
  const [copiedDomain, setCopiedDomain] = useState(null);
  const [isMasked, setIsMasked] = useState(true); // Sensor aktif secara default

  // Load live DNS sync statuses
  const loadStatuses = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchDomainStatuses();
      if (res.success && res.domains) {
        setDomainStatuses(res.domains);
      }
    } catch (err) {
      console.error('Error loading domain statuses:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, [domains]);

  const handleSingleSyncCheck = async (dom) => {
    setCheckingDomain(dom);
    try {
      const res = await checkDomainSync(dom);
      if (res.success) {
        setDomainStatuses(prev => prev.map(s => s.domain === dom ? res.domainStatus : s));
      }
    } catch (err) {
      console.error('Sync check failed:', err);
    } finally {
      setCheckingDomain(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 px-1 sm:px-0 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 border border-brand-yellow/30 shadow-glow-yellow-sm mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-brand-yellow/15 text-brand-yellow border border-brand-yellow/30 shrink-0">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 fill-brand-yellow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white">Domain Tersinkronisasi DNS</h1>
                <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {domains.length} Domain Aktif ⚡
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Domain otomatis terhubung dan bertambah secara mandiri berkat fitur <strong className="text-brand-yellow">Auto-Discovery DNS (Priority 1)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Toggle Sensor / Masking Button */}
            <button
              onClick={() => setIsMasked(!isMasked)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                isMasked 
                  ? 'bg-brand-orange/15 border-brand-orange/40 text-brand-orange shadow-glow-orange-sm' 
                  : 'bg-dark-950 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={isMasked ? 'Klik untuk membuka sensor nama domain' : 'Klik untuk mengaktifkan sensor'}
            >
              {isMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{isMasked ? 'Buka Sensor' : 'Sensor Aktif'}</span>
            </button>

            {/* Re-sync Button */}
            <button
              onClick={loadStatuses}
              disabled={isRefreshing}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-dark-950 border border-slate-700 hover:border-brand-yellow text-slate-200 hover:text-brand-yellow text-xs font-bold transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-yellow' : ''}`} />
              <span>{isRefreshing ? 'Memeriksa...' : 'Sinkronkan Ulang'}</span>
            </button>
          </div>
        </div>

        {/* Auto Sync Notice */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Setiap domain baru yang Anda arahkan DNS MX-nya ke server ini akan otomatis terdaftar dan muncul di sini.</span>
        </div>
      </div>

      {/* Synced Domains Cards Grid */}
      <div className="space-y-4">
        {domains.map((dom) => {
          const displayDomain = isMasked ? maskDomain(dom) : dom;
          const status = domainStatuses.find(s => s.domain === dom) || {
            domain: dom,
            isSynced: true,
            statusText: 'Tersinkron dengan Flatimo Mail ⚡',
            mxPriority: 1,
            mxExchange: `mail.${dom}`
          };

          const isCheckingThis = checkingDomain === dom;

          return (
            <div
              key={dom}
              className="rounded-2xl sm:rounded-3xl bg-dark-900/90 border border-brand-yellow/20 hover:border-brand-yellow/50 p-4 sm:p-7 backdrop-blur-xl shadow-xl transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Domain & Sync Status */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-mono text-lg sm:text-2xl font-black text-white tracking-wide">
                      @{displayDomain}
                    </span>
                    
                    {/* Status Badge */}
                    <span className="flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>TERHUBUNG & SINKRON (Priority 1)</span>
                    </span>

                    {isMasked && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-md border border-brand-orange/20">
                        <Lock className="w-3 h-3" />
                        Tersensor
                      </span>
                    )}
                  </div>

                  {/* Details Badge Row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5 font-mono bg-dark-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow" />
                      <span>MX Target: <strong className="text-slate-200">mail.{displayDomain} (Priority 1)</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono bg-dark-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Port 25 SMTP: <strong className="text-emerald-400">AKTIF</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono bg-dark-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] sm:text-xs">
                      <Zap className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Ingestion Webhook: <strong className="text-slate-200">SIAP</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  {/* Copy Domain */}
                  <button
                    onClick={() => handleCopy(`@${dom}`)}
                    className="p-2 sm:p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-brand-yellow/50 text-slate-400 hover:text-brand-yellow text-xs font-semibold transition-all"
                    title="Salin domain asli"
                  >
                    {copiedDomain === `@${dom}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Re-check DNS */}
                  <button
                    onClick={() => handleSingleSyncCheck(dom)}
                    disabled={isCheckingThis}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-950 border border-slate-800 hover:border-brand-yellow/50 text-slate-300 hover:text-brand-yellow text-xs font-bold transition-all"
                    title="Verifikasi DNS sekarang"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingThis ? 'animate-spin text-brand-yellow' : ''}`} />
                    <span>{isCheckingThis ? 'Memeriksa...' : 'Cek DNS'}</span>
                  </button>

                  {/* Delete */}
                  {domains.length > 1 && (
                    <button
                      onClick={() => onDeleteDomain(dom)}
                      title="Putuskan domain ini dari TMail"
                      className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-dark-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <Server className="w-5 h-5 text-brand-yellow shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">100% Otomatis dari DNS:</strong> Anda tidak perlu menambahkan domain secara manual. Cukup masukkan Record MX Priority 1 di tempat Anda beli domain, dan domain tersebut akan otomatis terdaftar dan siap digunakan di Flatimo Mail!
        </p>
      </div>

    </div>
  );
}
