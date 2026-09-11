import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode as QrIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function QrModal({ email, isOpen, onClose }) {
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-dark-900 border shadow-2xl p-6 text-center"
        style={{
          borderColor: glowEnabled ? `${primaryColor}50` : `${primaryColor}40`,
          boxShadow: glowEnabled ? `0 0 35px ${primaryColor}25` : `0 0 20px ${primaryColor}15`
        }}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="group absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-dark-950 border border-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4 icon-interactive group-hover:rotate-90" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center gap-2 mb-4" style={{ color: primaryColor }}>
          <QrIcon className="w-5 h-5 icon-pulse" />
          <h3 className="font-bold text-base text-white">Pindai QR Code Inbox</h3>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block mb-4 shadow-xl border-4" style={{ borderColor: `${primaryColor}40` }}>
          <QRCodeSVG
            value={`mailto:${email}`}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Email Address */}
        <div 
          className="font-mono text-xs font-bold break-all bg-dark-950 p-2.5 rounded-xl border mb-4 select-all"
          style={{ color: primaryColor, borderColor: `${primaryColor}35` }}
        >
          {email}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="group w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-dark-950 shadow-md transition-all active:scale-95 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            boxShadow: glowEnabled ? `0 0 15px ${primaryColor}40` : undefined
          }}
        >
          {copied ? <Check className="w-4 h-4 animate-in zoom-in" /> : <Copy className="w-4 h-4 icon-interactive group-hover:scale-125" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Alamat Email'}</span>
        </button>

      </div>
    </div>
  );
}
