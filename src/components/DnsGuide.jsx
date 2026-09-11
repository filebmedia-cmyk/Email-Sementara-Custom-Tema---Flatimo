import React, { useState } from 'react';
import { Check, Copy, Zap, Server, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DnsGuide() {
  const { primaryColor, secondaryColor } = useTheme();
  const [copiedKey, setCopiedKey] = useState(null);
  const [guideTab, setGuideTab] = useState('cloudflare'); // 'cloudflare' | 'registrar'

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 sm:mt-6 px-1 sm:px-0 animate-in fade-in duration-300">
      
      {/* Main Container */}
      <div 
        className="rounded-2xl sm:rounded-3xl bg-dark-900/95 border shadow-xl p-4 sm:p-7 md:p-8 backdrop-blur-xl"
        style={{
          borderColor: `${primaryColor}30`,
          boxShadow: `0 0 25px ${primaryColor}15`
        }}
      >
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 sm:pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border shrink-0 group"
              style={{
                backgroundColor: `${primaryColor}15`,
                borderColor: `${primaryColor}30`,
                color: primaryColor
              }}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 icon-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-white">
                Panduan Integrasi DNS Domain
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih metode integrasi domain Anda di bawah ini agar email dapat masuk 100% lancar:
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 bg-dark-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setGuideTab('cloudflare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                guideTab === 'cloudflare'
                  ? 'text-dark-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={guideTab === 'cloudflare' ? { backgroundColor: primaryColor } : {}}
            >
              Lewat Cloudflare (Rekomendasi)
            </button>
            <button
              onClick={() => setGuideTab('registrar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                guideTab === 'registrar'
                  ? 'text-dark-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={guideTab === 'registrar' ? { backgroundColor: primaryColor } : {}}
            >
              Di Registrar (Domainesia / Niagahoster)
            </button>
          </div>
        </div>

        {/* TAB 1: CLOUDFLARE ROUTING */}
        {guideTab === 'cloudflare' && (
          <div className="space-y-4">
            <div 
              className="p-4 rounded-xl bg-dark-950 border space-y-3 text-xs leading-relaxed text-slate-300"
              style={{ borderColor: `${primaryColor}25` }}
            >
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 icon-interactive" style={{ color: primaryColor }} />
                <span>Metode 1: Menggunakan Cloudflare Email Routing (100% Cepat & Gratis)</span>
              </div>
              <p>
                Jika domain Anda dikelola di <strong>Cloudflare</strong>, email akan diteruskan secara instan ke server Flatimo Mail:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-1 text-slate-300">
                <li>Buka domain Anda di Dashboard <strong>Cloudflare</strong> $\rightarrow$ menu <strong>Email Routing</strong>.</li>
                <li>Klik <strong>Enable Email Routing</strong> $\rightarrow$ izinkan Cloudflare memasang DNS otomatis.</li>
                <li>Masuk ke tab <strong>Routing Rules</strong> $\rightarrow$ pada bagian <strong>Catch-all rule</strong>:
                  <ul className="list-disc list-inside pl-4 pt-1 text-slate-400">
                    <li>Pilih Action: <strong>Send to a Worker</strong>.</li>
                    <li>Pilih Worker: <strong>mailflatimo-web</strong>.</li>
                    <li>Klik <strong>Save</strong>.</li>
                  </ul>
                </li>
              </ol>
              <div className="pt-2 text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 icon-pulse" />
                <span>Selesai! Seluruh email ke domain tersebut akan langsung mengalir ke inbox dalam hitungan detik.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTRAR LANGSUNG */}
        {guideTab === 'registrar' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 icon-interactive" style={{ color: secondaryColor }} />
                <span>Metode 2: Pasang MX di Panel Registrar (Domainesia / Niagahoster / Namecheap)</span>
              </div>
              <p>
                Tambahkan 3 baris Record MX resmi ini di menu DNS Management domain Anda:
              </p>

              {/* Table Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate-800 rounded-lg">
                  <thead className="bg-dark-900 text-slate-400">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Tipe</th>
                      <th className="p-2 border-b border-slate-800">Host/Nama</th>
                      <th className="p-2 border-b border-slate-800">Target Server</th>
                      <th className="p-2 border-b border-slate-800">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-2 font-bold" style={{ color: secondaryColor }}>MX</td>
                      <td className="p-2">@</td>
                      <td className="p-2" style={{ color: primaryColor }}>rute1.mx.cloudflare.net</td>
                      <td className="p-2">10</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold" style={{ color: secondaryColor }}>MX</td>
                      <td className="p-2">@</td>
                      <td className="p-2" style={{ color: primaryColor }}>rute2.mx.cloudflare.net</td>
                      <td className="p-2">50</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold" style={{ color: secondaryColor }}>MX</td>
                      <td className="p-2">@</td>
                      <td className="p-2" style={{ color: primaryColor }}>rute3.mx.cloudflare.net</td>
                      <td className="p-2">99</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-400">TXT</td>
                      <td className="p-2">@</td>
                      <td className="p-2 text-slate-300">v=spf1 include:_spf.mx.cloudflare.net ~all</td>
                      <td className="p-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
