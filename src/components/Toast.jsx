import React from 'react';
import { Zap, X, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Toast({ toast, toasts, onClose, onDismiss }) {
  const { primaryColor, glowEnabled } = useTheme();

  const handleClose = onClose || onDismiss;

  // Single toast mode
  if (toast) {
    return (
      <div
        className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 bg-dark-900/95"
        style={{
          borderColor: glowEnabled ? `${primaryColor}60` : `${primaryColor}40`,
          boxShadow: glowEnabled ? `0 0 25px ${primaryColor}30, 0 10px 30px rgba(0,0,0,0.8)` : `0 10px 30px rgba(0,0,0,0.8)`
        }}
      >
        <div 
          className="p-2 rounded-xl shrink-0 border group"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}40`,
            color: primaryColor,
            boxShadow: glowEnabled ? `0 0 10px ${primaryColor}30` : undefined
          }}
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 icon-shake" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-xs mb-0.5" style={{ color: primaryColor }}>
            {toast.title || 'Notifikasi'}
          </div>
          <div className="text-xs text-white font-semibold break-words">
            {toast.message}
          </div>
          {toast.subtitle && (
            <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
              {toast.subtitle}
            </div>
          )}
        </div>

        {handleClose && (
          <button
            onClick={handleClose}
            className="group p-1 rounded-lg text-slate-500 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 icon-interactive group-hover:rotate-90" />
          </button>
        )}
      </div>
    );
  }

  // Array mode
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 bg-dark-900/95"
          style={{
            borderColor: glowEnabled ? `${primaryColor}60` : `${primaryColor}40`,
            boxShadow: glowEnabled ? `0 0 25px ${primaryColor}30` : undefined
          }}
        >
          <div 
            className="p-2 rounded-xl shrink-0 border group"
            style={{
              backgroundColor: `${primaryColor}15`,
              borderColor: `${primaryColor}30`,
              color: primaryColor
            }}
          >
            <Bell className="w-5 h-5 icon-shake" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs mb-0.5" style={{ color: primaryColor }}>
              {t.title || 'Email Baru Masuk'}
            </div>
            <div className="text-xs text-white font-semibold truncate">
              {t.message}
            </div>
            {t.subtitle && (
              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                {t.subtitle}
              </div>
            )}
          </div>

          {handleClose && (
            <button
              onClick={() => handleClose(t.id)}
              className="group p-1 rounded-lg text-slate-500 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4 icon-interactive group-hover:rotate-90" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
