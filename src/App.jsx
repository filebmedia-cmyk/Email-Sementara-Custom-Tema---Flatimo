import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import InboxGenerator from './components/InboxGenerator';
import MessageList from './components/MessageList';
import MessageViewer from './components/MessageViewer';
import ApiDocs from './components/ApiDocs';
import SettingsView from './components/SettingsView';
import PasswordGate from './components/PasswordGate';
import QrModal from './components/QrModal';
import TestEmailModal from './components/TestEmailModal';
import ThemeSettingsModal from './components/ThemeSettingsModal';
import PromoModal from './components/PromoModal';
import Toast from './components/Toast';
import DynamicBackground from './components/DynamicBackground';
import { useTheme } from './context/ThemeContext';

import { 
  fetchDomains, 
  generateInbox, 
  createCustomInbox, 
  fetchMessages, 
  fetchMessageDetail, 
  deleteMessage as apiDeleteMessage, 
  deleteInbox as apiDeleteInbox,
  fetchStats,
  fetchAuthStatus,
  fetchPopupConfig
} from './utils/api';

import { playMailSound } from './utils/sound';

// Helper to extract email from URL path, query params, or hash
function getEmailFromUrl(availableDomains = []) {
  try {
    const defaultDomain = availableDomains[0] || 'mailflatimo.web.id';

    // 1. Check Query params & Query search string
    // e.g. ?email=budi@domain.com, ?inbox=budi@domain.com, ?budi@domain.com, ?email@domain.com
    const rawSearch = decodeURIComponent(window.location.search || '').replace(/^\?/, '').trim();
    if (rawSearch) {
      const params = new URLSearchParams(window.location.search);
      const qEmail = params.get('email') || params.get('inbox') || params.get('e') || params.get('to') || params.get('address') || params.get('mail');
      if (qEmail) {
        return qEmail.includes('@') ? qEmail.trim().toLowerCase() : `${qEmail.trim().toLowerCase()}@${defaultDomain}`;
      }

      // If query is directly "?budi@domain.com" or "?budi"
      if (rawSearch.includes('@') && !rawSearch.includes('=')) {
        return rawSearch.trim().toLowerCase();
      }

      // Check all key-values in query
      for (const [key, val] of params.entries()) {
        if (key.includes('@')) return key.trim().toLowerCase();
        if (val && val.includes('@')) return val.trim().toLowerCase();
      }

      // If query is just a username e.g. "?budi"
      if (rawSearch && !rawSearch.includes('=') && !rawSearch.includes('&') && !rawSearch.includes('/')) {
        return `${rawSearch.toLowerCase()}@${defaultDomain}`;
      }
    }

    // 2. Check Path: /inbox/budi@domain.com, /mailbox/budi@domain.com, /budi@domain.com, /budi/domain.com
    const path = decodeURIComponent(window.location.pathname || '').replace(/^\/+/, '').trim();
    if (path && path !== 'index.html') {
      if (path.startsWith('inbox/')) {
        const candidate = path.substring(6).trim();
        if (candidate.includes('@')) return candidate.toLowerCase();
        if (candidate.includes('/')) {
          const [u, d] = candidate.split('/');
          return `${u.toLowerCase()}@${d.toLowerCase()}`;
        }
        if (candidate.length > 0) return `${candidate.toLowerCase()}@${defaultDomain}`;
      }
      if (path.startsWith('mailbox/')) {
        const candidate = path.substring(8).trim();
        if (candidate.includes('@')) return candidate.toLowerCase();
        if (candidate.includes('/')) {
          const [u, d] = candidate.split('/');
          return `${u.toLowerCase()}@${d.toLowerCase()}`;
        }
        if (candidate.length > 0) return `${candidate.toLowerCase()}@${defaultDomain}`;
      }
      if (path.includes('@')) {
        return path.toLowerCase();
      }
      // Format: /username/domain.com
      const segments = path.split('/').filter(Boolean);
      if (segments.length === 2 && segments[1].includes('.')) {
        return `${segments[0].toLowerCase()}@${segments[1].toLowerCase()}`;
      }
    }

    // 3. Check Hash: #budi@domain.com or #/inbox/budi@domain.com
    const hash = decodeURIComponent(window.location.hash || '').replace(/^#\/?(inbox\/|mailbox\/)?/, '').trim();
    if (hash) {
      if (hash.includes('@')) return hash.toLowerCase();
      if (hash.length > 0 && !hash.includes('/')) return `${hash.toLowerCase()}@${defaultDomain}`;
    }
  } catch (e) {
    console.error('Error parsing email from URL:', e);
  }
  return null;
}

export default function App() {
  const { siteTitle, primaryColor } = useTheme();

  // Navigation state: 'inbox' | 'api' | 'settings'
  const [activeTab, setActiveTab] = useState('inbox');
  const [httpDocsMode, setHttpDocsMode] = useState('public');
  
  // Password Protection state (Default OFF as instructed)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [domains, setDomains] = useState(['mailflatimo.web.id']);
  const [currentUsername, setCurrentUsername] = useState('spark.runner101');
  const [currentDomain, setCurrentDomain] = useState('mailflatimo.web.id');
  const [currentEmail, setCurrentEmail] = useState('spark.runner101@mailflatimo.web.id');
  
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [popupConfig, setPopupConfig] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [stats, setStats] = useState(null);

  const eventSourceRef = useRef(null);

  // Helper toast notification
  const addToast = (type, title, message, subtitle) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message, subtitle }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper update browser URL seamlessly without reload
  const updateUrlForEmail = (email) => {
    if (!email) return;
    try {
      const targetPath = `/inbox/${email}`;
      if (window.location.pathname !== targetPath) {
        window.history.replaceState({ email }, '', targetPath);
      }
    } catch (e) {}
  };

  // 1. Initial Load & Auth Check
  useEffect(() => {
    async function init() {
      try {
        // Check website password protection & public settings status
        const authData = await fetchAuthStatus();
        if (authData.success) {
          if (authData.httpDocsMode) {
            setHttpDocsMode(authData.httpDocsMode);
          }
          if (authData.popupEnabled !== undefined) {
            setPopupConfig({
              popupEnabled: Boolean(authData.popupEnabled),
              popupTitle: authData.popupTitle || '',
              popupMessage: authData.popupMessage || '',
              popupImageUrl: authData.popupImageUrl || '',
              popupButtonText: authData.popupButtonText || 'Lihat Selengkapnya',
              popupButtonUrl: authData.popupButtonUrl || '',
              popupFrequency: authData.popupFrequency || 'once_per_session'
            });
          }
          if (authData.isPasswordProtected) {
            setIsPasswordProtected(true);
            const savedToken = localStorage.getItem('tmail_access_token');
            if (savedToken) {
              setIsUnlocked(true);
            }
          } else {
            setIsPasswordProtected(false);
            setIsUnlocked(true);
          }
        } else {
          setIsPasswordProtected(false);
          setIsUnlocked(true);
        }

        // Fetch domains dynamically from VPS database
        let activeDomains = ['mailflatimo.web.id'];
        const domData = await fetchDomains();
        if (domData.success && domData.domains.length > 0) {
          setDomains(domData.domains);
          activeDomains = domData.domains;
        }

        // Check if an email was requested in URL
        const urlEmail = getEmailFromUrl(activeDomains);

        if (urlEmail) {
          const parts = urlEmail.split('@');
          const uName = parts[0];
          const dName = parts[1] || activeDomains[0];

          setCurrentUsername(uName);
          setCurrentDomain(dName);
          setCurrentEmail(urlEmail);
          updateUrlForEmail(urlEmail);
          loadInboxMessages(urlEmail);
        } else {
          // Generate initial random email
          const genData = await generateInbox(activeDomains[0]);
          if (genData.success) {
            setCurrentUsername(genData.username);
            setCurrentDomain(genData.domain);
            setCurrentEmail(genData.email);
            updateUrlForEmail(genData.email);
            loadInboxMessages(genData.email);
          }
        }

        // Fetch stats
        const st = await fetchStats();
        if (st.success) setStats(st.stats);

      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    init();
  }, []);

  // 2. Real-time Live EventSource (SSE Stream)
  useEffect(() => {
    if (!currentEmail) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const sseUrl = `/api/v1/stream?inbox=${encodeURIComponent(currentEmail)}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'init') {
          setMessages(payload.messages || []);
        } else if (payload.type === 'new_mail') {
          const newMsg = payload.message;
          setMessages(prev => [newMsg, ...prev.filter(m => m.id !== newMsg.id)]);

          if (soundEnabled) {
            playMailSound();
          }

          addToast(
            'mail',
            `Email Baru dari ${newMsg.from?.name || newMsg.from?.address || 'Pengirim'}`,
            newMsg.subject || '(Tanpa Subjek)',
            currentEmail
          );
        } else if (payload.type === 'deleted_mail') {
          setMessages(prev => prev.filter(m => m.id !== payload.messageId));
          if (selectedMessage && selectedMessage.id === payload.messageId) {
            setSelectedMessage(null);
          }
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e);
      }
    };

    es.onerror = () => {
      // Reconnect handled automatically by EventSource
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [currentEmail, soundEnabled]);

  // 2.5 Real-time 1-Second Auto Refresh Polling (Sync every 1000ms)
  useEffect(() => {
    if (!currentEmail) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetchMessages(currentEmail);
        if (!isMounted) return;

        if (res.success && Array.isArray(res.messages)) {
          setMessages(prev => {
            const prevIds = new Set(prev.map(m => m.id));
            const newItems = res.messages.filter(m => !prevIds.has(m.id));

            if (newItems.length > 0) {
              if (soundEnabled) {
                playMailSound();
              }
              newItems.forEach(msg => {
                addToast(
                  'mail',
                  `Email Baru dari ${msg.from?.name || msg.from?.address || 'Pengirim'}`,
                  msg.subject || '(Tanpa Subjek)',
                  currentEmail
                );
              });
              return res.messages;
            }

            // If count changed or messages deleted
            if (res.messages.length !== prev.length) {
              return res.messages;
            }

            return prev;
          });
        }
      } catch (err) {
        // Silent error during 1s background polling
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentEmail, soundEnabled]);

  // Load inbox messages (with optional manual refresh feedback)
  const loadInboxMessages = async (email, manual = false) => {
    if (!email) return;
    if (manual) setIsRefreshing(true);
    try {
      const res = await fetchMessages(email);
      if (res.success) {
        setMessages(res.messages || []);
        if (manual) {
          addToast('success', 'Kotak Masuk Disegarkan', `Ditemukan ${res.messages?.length || 0} pesan masuk.`);
        }
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      if (manual) {
        addToast('error', 'Gagal Memuat Pesan', 'Periksa koneksi internet Anda.');
      }
    } finally {
      if (manual) {
        setTimeout(() => setIsRefreshing(false), 300);
      }
    }
  };

  // Generate new random email
  const handleGenerateNew = async () => {
    setIsRefreshing(true);
    setSelectedMessage(null);
    try {
      const res = await generateInbox(currentDomain);
      if (res.success) {
        setCurrentUsername(res.username);
        setCurrentDomain(res.domain);
        setCurrentEmail(res.email);
        updateUrlForEmail(res.email);
        setMessages([]);
        addToast('success', 'Email Baru Dibuat', res.email);
      }
    } catch (err) {
      addToast('error', 'Gagal Membuat Email', 'Silakan coba lagi');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Create custom email
  const handleCreateCustom = async (username, domain) => {
    setIsRefreshing(true);
    setSelectedMessage(null);
    try {
      const res = await createCustomInbox(username, domain);
      if (res.success) {
        setCurrentUsername(res.username);
        setCurrentDomain(res.domain);
        setCurrentEmail(res.email);
        updateUrlForEmail(res.email);
        setMessages([]);
        addToast('success', 'Kotak Masuk Diubah', res.email);
      }
    } catch (err) {
      addToast('error', 'Gagal Mengubah Email', 'Silakan periksa format nama');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete current inbox
  const handleDeleteCurrent = async () => {
    if (!currentEmail) return;
    if (confirm(`Apakah Anda yakin ingin menghapus seluruh pesan pada inbox ${currentEmail}?`)) {
      try {
        await apiDeleteInbox(currentEmail);
        setMessages([]);
        setSelectedMessage(null);
        addToast('info', 'Kotak Masuk Dikosongkan', currentEmail);
      } catch (err) {
        addToast('error', 'Gagal Menghapus Pesan', 'Terjadi kesalahan sistem');
      }
    }
  };

  // Select and read message detail
  const handleSelectMessage = async (msgSummary) => {
    const id = typeof msgSummary === 'object' ? msgSummary?.id : msgSummary;
    if (!id) return;
    setIsLoadingMessage(true);
    try {
      const res = await fetchMessageDetail(id);
      if (res.success && res.message) {
        setSelectedMessage(res.message);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      }
    } catch (err) {
      addToast('error', 'Gagal Membuka Pesan', 'Pesan mungkin telah kedaluwarsa');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  // Delete single message
  const handleDeleteMessage = async (id) => {
    try {
      await apiDeleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
      addToast('info', 'Pesan Dihapus', 'Pesan berhasil dibersihkan dari server');
    } catch (err) {
      addToast('error', 'Gagal Menghapus', 'Terjadi kesalahan');
    }
  };

  // If checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 text-slate-100">
        <div className="w-8 h-8 border-3 border-slate-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  // If website password protection is ON and user hasn't unlocked yet
  if (isPasswordProtected && !isUnlocked) {
    return <PasswordGate onUnlocked={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-black transition-colors duration-300 relative">
      
      {/* Dynamic Visual Particle Background */}
      <DynamicBackground />

      {/* Main Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        httpDocsMode={httpDocsMode}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Main Body Content with High Stacking Context */}
      <main className="flex-1 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
        
        {/* TAB 1: KOTAK MASUK (INBOX & VIEWER) */}
        {activeTab === 'inbox' && (
          <>
            {/* Top Email Generator & Customizer Bar */}
            <InboxGenerator
              currentEmail={currentEmail}
              currentUsername={currentUsername}
              currentDomain={currentDomain}
              domains={domains}
              onGenerateNew={handleGenerateNew}
              onCreateCustom={handleCreateCustom}
              onDeleteCurrent={handleDeleteCurrent}
              onOpenQrModal={() => setIsQrModalOpen(true)}
              onRefresh={() => loadInboxMessages(currentEmail, true)}
              isRefreshing={isRefreshing}
              addToast={addToast}
            />

            {/* Email Inbox Content (2-Column Grid) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Messages List (5 Cols) */}
                <div className="lg:col-span-5 w-full">
                  <MessageList
                    messages={messages}
                    selectedId={selectedMessage?.id}
                    onSelectMessage={handleSelectMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onOpenTestModal={() => setIsTestModalOpen(true)}
                    onRefresh={() => loadInboxMessages(currentEmail, true)}
                    isRefreshing={isRefreshing}
                    currentEmail={currentEmail}
                  />
                </div>

                {/* Right Column: Full Message Reader / Viewer (7 Cols) */}
                <div className="lg:col-span-7 w-full">
                  <MessageViewer
                    message={selectedMessage}
                    isLoading={isLoadingMessage}
                    onClose={() => setSelectedMessage(null)}
                    onDelete={handleDeleteMessage}
                    onOpenTestModal={() => setIsTestModalOpen(true)}
                    addToast={addToast}
                  />
                </div>

              </div>
            </div>
          </>
        )}

        {/* TAB 2: DOKUMENTASI REST API PUBLIK */}
        {activeTab === 'api' && (
          <ApiDocs currentEmail={currentEmail} />
        )}

        {/* TAB 3: PENGATURAN SISTEM (API KEY, WEBHOOK, DOMAIN & PASSWORD ACCESS LOCK) */}
        {activeTab === 'settings' && (
          <SettingsView 
            addToast={addToast} 
            initialDomains={domains}
            onDomainsChange={(newDoms) => setDomains(newDoms)}
            onSettingsUpdated={(updated) => {
              if (updated.httpDocsMode) setHttpDocsMode(updated.httpDocsMode);
              if (updated.isPasswordProtected !== undefined) setIsPasswordProtected(Boolean(updated.isPasswordProtected));
              if (updated.popupEnabled !== undefined) {
                setPopupConfig({
                  popupEnabled: Boolean(updated.popupEnabled),
                  popupTitle: updated.popupTitle || '',
                  popupMessage: updated.popupMessage || '',
                  popupImageUrl: updated.popupImageUrl || '',
                  popupButtonText: updated.popupButtonText || 'Lihat Selengkapnya',
                  popupButtonUrl: updated.popupButtonUrl || '',
                  popupFrequency: updated.popupFrequency || 'once_per_session'
                });
              }
            }}
          />
        )}

      </main>

      {/* Modals */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        email={currentEmail}
      />

      <TestEmailModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        targetEmail={currentEmail}
        addToast={addToast}
      />

      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Pop-up Notifikasi & Promosi Global */}
      <PromoModal
        config={popupConfig}
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

    </div>
  );
}
