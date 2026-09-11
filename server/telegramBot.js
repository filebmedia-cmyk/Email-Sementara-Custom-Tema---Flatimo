import dns from 'dns';
const { Resolver } = dns.promises;
import { db } from './db.js';
import { config } from './config.js';
import { eventBus } from './eventBus.js';

const BOT_TOKEN = '8930418014:AAH36qodGrL87Q3i6WukUBayuoGSKRaEvyY';
const ADMIN_ID = '6286514348';
const API_BASE = `http://127.0.0.1:${config.port || 3000}/api/v1`;
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// State storage per user
const userSessions = new Map();
// Authenticated Admin Chat IDs
const authenticatedAdmins = new Set([ADMIN_ID]);
// Active registered domains to notify users when test email arrives
const domainWatchers = new Map(); // domain -> chatId

// Helper Telegram API calls
async function callTelegram(method, body) {
  try {
    const res = await fetch(`${TG_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error(`[TelegramBot Error] ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function sendMessage(chatId, text, replyMarkup = null) {
  return await callTelegram('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
    disable_web_page_preview: true
  });
}

async function editMessage(chatId, messageId, text, replyMarkup = null) {
  return await callTelegram('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    reply_markup: replyMarkup,
    disable_web_page_preview: true
  });
}

async function deleteMessage(chatId, messageId) {
  if (!chatId || !messageId) return;
  try {
    await callTelegram('deleteMessage', {
      chat_id: chatId,
      message_id: messageId
    });
  } catch (e) {}
}

async function answerCallback(callbackQueryId, text = null) {
  return await callTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text: text || undefined
  });
}

// Seamless Single-Card Session Manager: Edits the active message in place (Timpa/Edit)
async function sendOrEditSessionMessage(chatId, text, replyMarkup = null, newState = null) {
  const session = userSessions.get(chatId) || {};
  const existingMsgId = session.messageId;

  if (existingMsgId) {
    const editRes = await editMessage(chatId, existingMsgId, text, replyMarkup);
    if (editRes.ok) {
      userSessions.set(chatId, { 
        ...session, 
        state: newState !== null ? newState : session.state,
        messageId: existingMsgId 
      });
      return editRes;
    }
    // If edit failed (message deleted or expired), delete previous reference
    await deleteMessage(chatId, existingMsgId);
  }

  const sendRes = await sendMessage(chatId, text, replyMarkup);
  if (sendRes.ok && sendRes.result) {
    userSessions.set(chatId, { 
      ...session, 
      state: newState !== null ? newState : session.state,
      messageId: sendRes.result.message_id 
    });
  }
  return sendRes;
}

// Escape HTML special characters for safe Telegram display
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Strict Real-World DNS MX Checker helper
async function verifyDomainMx(domain) {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  try {
    const mxRecords = await resolver.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { 
        success: false, 
        reason: 'Record MX tidak ditemukan pada domain ini.',
        foundRecords: []
      };
    }

    mxRecords.sort((a, b) => a.priority - b.priority);

    const isTargetMatched = mxRecords.some(r => {
      const ex = (r.exchange || '').toLowerCase();
      return ex.includes('cloudflare.net') || ex.includes('mailflatimo') || ex.includes('flatimo');
    });

    if (!isTargetMatched) {
      const currentExchanges = mxRecords.map(r => `${r.exchange} (Priority ${r.priority})`).join(', ');
      return {
        success: false,
        reason: `Record MX saat ini mengarah ke: ${currentExchanges}.`,
        foundRecords: mxRecords
      };
    }

    return {
      success: true,
      records: mxRecords,
      isTargetMatched: true
    };
  } catch (err) {
    let reason = err.message;
    if (err.code === 'ENODATA' || err.code === 'ENOTFOUND') {
      reason = 'Record MX belum terdeteksi di server DNS global. Pastikan Anda sudah menyimpan pengaturan DNS dan menunggu 1-2 menit.';
    }
    return {
      success: false,
      reason,
      foundRecords: []
    };
  }
}

// Clean Keyboard layouts with Telegram native button styles (primary = blue, success = green, danger = red)
function getAdminMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Buka Web Tools Flatimo', url: 'https://mailflatimo.web.id', style: 'primary' }
      ],
      [
        { text: 'Cek Inbox Email (Live)', callback_data: 'bot_check_inbox', style: 'primary' }
      ],
      [
        { text: 'Tambah Domain', callback_data: 'admin_add_domain', style: 'success' },
        { text: 'Hapus Domain', callback_data: 'admin_del_domain', style: 'danger' }
      ],
      [
        { text: 'Daftar Domain Aktif', callback_data: 'admin_list_domains', style: 'primary' },
        { text: 'Statistik Server', callback_data: 'admin_stats', style: 'primary' }
      ],
      [
        { text: 'Kunci Panel Admin', callback_data: 'admin_lock', style: 'danger' }
      ]
    ]
  };
}

function getPublicMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Buka Web Tools Flatimo', url: 'https://mailflatimo.web.id', style: 'primary' }
      ],
      [
        { text: 'Cek Inbox Email (Live)', callback_data: 'bot_check_inbox', style: 'primary' }
      ]
    ]
  };
}

function getMainMenuKeyboard(chatId) {
  const isAuth = authenticatedAdmins.has(String(chatId));
  return isAuth ? getAdminMenuKeyboard() : getPublicMenuKeyboard();
}

function getDnsGuideKeyboard(domain) {
  return {
    inline_keyboard: [
      [
        { text: 'Saya Sudah Pasang DNS', callback_data: `verify_dns_${domain}`, style: 'success' }
      ],
      [
        { text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }
      ]
    ]
  };
}

function getVerifiedSuccessKeyboard(domain) {
  return {
    inline_keyboard: [
      [
        { text: 'Kirim Test Email Otomatis', callback_data: `auto_test_${domain}`, style: 'success' }
      ],
      [
        { text: 'Buka SendTestEmail.com', url: 'https://sendtestemail.com/', style: 'primary' },
        { text: 'Buka Inbox di Web', url: `https://mailflatimo.web.id/inbox/test@${domain}`, style: 'primary' }
      ],
      [
        { text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }
      ]
    ]
  };
}

function getCancelKeyboard() {
  return {
    inline_keyboard: [
      [{ text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }]
    ]
  };
}

// Handle updates (Clean Single-Card In-Place Editing)
async function handleUpdate(update) {
  // 1. Handle Callback Query (Inline Button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const messageId = cb.message.message_id;
    const data = cb.data;
    const strChatId = String(chatId);
    const isAdmin = authenticatedAdmins.has(strChatId);

    await answerCallback(cb.id);

    // Save active messageId in session
    userSessions.set(chatId, { ...(userSessions.get(chatId) || {}), messageId });

    // Cancel action / Back to Main Menu
    if (data === 'cancel_action') {
      userSessions.set(chatId, { state: null, messageId });
      const text = isAdmin 
        ? `<b>PANEL KONTROL ADMIN FLATIMO MAIL</b>\n<blockquote>Silakan pilih menu manajemen yang tersedia di bawah:</blockquote>`
        : `<b>FLATIMO MAIL - SISTEM EMAIL SEMENTARA</b>\n<blockquote>Layanan email sementara mandiri. Gunakan menu di bawah untuk memeriksa kotak masuk email dan menerima kode verifikasi / OTP secara real-time.</blockquote>`;
      return await editMessage(chatId, messageId, text, getMainMenuKeyboard(chatId));
    }

    // Request Admin Login (PIN Gate)
    if (data === 'request_admin_login') {
      userSessions.set(chatId, { state: 'AWAITING_ADMIN_PIN', messageId });
      const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Silakan ketik 4 digit PIN / Password Admin untuk membuka panel kontrol admin:</blockquote>`;
      return await editMessage(chatId, messageId, pinText, getCancelKeyboard());
    }

    // Lock Admin Panel
    if (data === 'admin_lock') {
      authenticatedAdmins.delete(strChatId);
      userSessions.set(chatId, { state: null, messageId });
      const text = `<b>PANEL ADMIN BERHASIL DIKUNCI</b>\n<blockquote>Anda telah keluar dari mode admin. Masukkan PIN kembali jika ingin membuka panel admin.</blockquote>`;
      return await editMessage(chatId, messageId, text, getPublicMenuKeyboard());
    }

    // Bot: Check Inbox Menu
    if (data === 'bot_check_inbox') {
      userSessions.set(chatId, { state: 'AWAITING_INBOX_QUERY', messageId });
      const text = `<b>CEK KOTAK MASUK EMAIL</b>\n<blockquote>Silakan ketik alamat email sementara yang ingin Anda periksa pesan-pesannya.\n\nContoh: <code>user123@mailflatimo.web.id</code></blockquote>`;
      return await editMessage(chatId, messageId, text, getCancelKeyboard());
    }

    // Bot: Read Full Message Detail (In-Place Edit)
    if (data.startsWith('read_full_')) {
      const msgId = data.replace('read_full_', '').trim();
      const msg = db.getMessageById(msgId);

      if (!msg) {
        return await editMessage(chatId, messageId, `<b>PESAN TIDAK DITEMUKAN</b>\n<blockquote>Pesan ini mungkin telah dihapus atau kedaluwarsa dari server.</blockquote>`, getCancelKeyboard());
      }

      const senderStr = msg.from?.name 
        ? `${msg.from.name} <${msg.from.address || msg.from.text}>` 
        : (msg.from?.address || msg.from?.text || 'Unknown');

      const fullText = (msg.text || '').trim() || '(Tidak ada konten teks polos)';
      const cleanBody = fullText.length > 3000 ? fullText.substring(0, 3000) + '\n\n...(Pesan dipotong karena batas panjang teks)' : fullText;

      const otpSection = (msg.otp || msg.code || msg.verification_code) 
        ? `\n• <b>Kode OTP / Verifikasi:</b> <code>${msg.otp || msg.code || msg.verification_code}</code>` 
        : '';
      const linkSection = msg.verification_link 
        ? `\n• <b>Tautan Verifikasi:</b> <a href="${msg.verification_link}">Buka Tautan Verifikasi</a>` 
        : '';

      const fullViewText = `<b>ISI PESAN EMAIL LENGKAP</b>\n` +
        `<blockquote>` +
        `• <b>ID Pesan:</b> <code>${msg.id}</code>\n` +
        `• <b>Kotak Masuk:</b> <code>${msg.inboxEmail}</code>\n` +
        `• <b>Dari:</b> <code>${escapeHtml(senderStr)}</code>\n` +
        `• <b>Tanggal:</b> <code>${new Date(msg.date).toLocaleString('id-ID')}</code>\n` +
        `• <b>Subjek:</b> <b>${escapeHtml(msg.subject || '(Tanpa Subjek)')}</b>` +
        otpSection +
        linkSection +
        `\n• <b>Jumlah Lampiran:</b> ${msg.attachments ? msg.attachments.length : 0}` +
        `</blockquote>\n\n` +
        `<b>KONTEN PESAN:</b>\n` +
        `<pre>${escapeHtml(cleanBody)}</pre>`;

      const fullKeyboard = {
        inline_keyboard: [
          [
            { text: 'Hapus Pesan Ini', callback_data: `del_msg_${msg.id}`, style: 'danger' },
            { text: 'Buka di Web', url: `https://mailflatimo.web.id/inbox/${encodeURIComponent(msg.inboxEmail)}`, style: 'primary' }
          ],
          [
            { text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }
          ]
        ]
      };

      return await editMessage(chatId, messageId, fullViewText, fullKeyboard);
    }

    // Bot: Delete Message
    if (data.startsWith('del_msg_')) {
      const msgId = data.replace('del_msg_', '').trim();
      const deleted = db.deleteMessage(msgId);

      const deleteResultText = deleted 
        ? `<b>PESAN BERHASIL DIHAPUS</b>\n<blockquote>Pesan dengan ID <code>${msgId}</code> telah dibersihkan dari server.</blockquote>`
        : `<b>PESAN TIDAK DITEMUKAN</b>\n<blockquote>Pesan dengan ID <code>${msgId}</code> sudah tidak tersedia di database.</blockquote>`;

      return await editMessage(chatId, messageId, deleteResultText, getCancelKeyboard());
    }

    // Admin: Add domain button
    if (data === 'admin_add_domain' || data === 'user_add_domain') {
      if (!isAdmin) {
        userSessions.set(chatId, { state: 'AWAITING_ADMIN_PIN', messageId });
        const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Fitur penambahan domain hanya dapat diakses oleh Admin/Owner.\n\nSilakan ketik 4 digit PIN / Password Admin untuk melanjutkan:</blockquote>`;
        return await editMessage(chatId, messageId, pinText, getCancelKeyboard());
      }
      userSessions.set(chatId, { state: 'AWAITING_ADMIN_DOMAIN', messageId });
      const text = `<b>TAMBAH DOMAIN (ADMIN)</b>\n<blockquote>Silakan ketik nama domain yang ingin didaftarkan ke Flatimo Mail:</blockquote>`;
      return await editMessage(chatId, messageId, text, getCancelKeyboard());
    }

    // Admin: List domains
    if (data === 'admin_list_domains') {
      if (!isAdmin) {
        userSessions.set(chatId, { state: 'AWAITING_ADMIN_PIN', messageId });
        const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Silakan ketik PIN Admin untuk melihat daftar domain:</blockquote>`;
        return await editMessage(chatId, messageId, pinText, getCancelKeyboard());
      }

      const domains = db.getDomains();
      let listFormatted = '';
      domains.forEach((d, i) => {
        listFormatted += `${i + 1}. <code>${d}</code>\n`;
      });

      const text = `<b>DAFTAR DOMAIN AKTIF (${domains.length})</b>\n` +
        `<blockquote>` +
        listFormatted +
        `</blockquote>\n\n` +
        `Website: https://mailflatimo.web.id`;

      return await editMessage(chatId, messageId, text, getCancelKeyboard());
    }

    // Admin: Delete domain menu
    if (data === 'admin_del_domain') {
      if (!isAdmin) {
        userSessions.set(chatId, { state: 'AWAITING_ADMIN_PIN', messageId });
        const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Silakan ketik PIN Admin untuk menghapus domain:</blockquote>`;
        return await editMessage(chatId, messageId, pinText, getCancelKeyboard());
      }

      const domains = db.getDomains();
      if (domains.length <= 1) {
        return await editMessage(chatId, messageId, `<b>HAPUS DOMAIN</b>\n<blockquote>Hanya tersisa 1 domain utama. Domain utama tidak dapat dihapus.</blockquote>`, getCancelKeyboard());
      }

      const buttons = domains.map(d => [
        { text: `Hapus: ${d}`, callback_data: `confirm_del_${d}`, style: 'danger' }
      ]);
      buttons.push([{ text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }]);

      return await editMessage(chatId, messageId, `<b>PILIH DOMAIN YANG INGIN DIHAPUS</b>\n<blockquote>Pilih salah satu domain di bawah untuk menghapusnya dari sistem:</blockquote>`, {
        inline_keyboard: buttons
      });
    }

    // Admin: Confirm delete
    if (data.startsWith('confirm_del_') && isAdmin) {
      const domainToDel = data.replace('confirm_del_', '').trim();
      db.removeDomain(domainToDel);
      domainWatchers.delete(domainToDel);

      return await editMessage(chatId, messageId, `<b>DOMAIN BERHASIL DIHAPUS</b>\n<blockquote>Domain <code>${domainToDel}</code> telah dibersihkan dari sistem Flatimo Mail.</blockquote>`, getCancelKeyboard());
    }

    // Admin: Server Stats
    if (data === 'admin_stats') {
      if (!isAdmin) {
        userSessions.set(chatId, { state: 'AWAITING_ADMIN_PIN', messageId });
        const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Silakan ketik PIN Admin untuk melihat statistik server:</blockquote>`;
        return await editMessage(chatId, messageId, pinText, getCancelKeyboard());
      }

      const domains = db.getDomains();
      const inboxes = db.inboxes ? db.inboxes.size : 0;
      const messages = db.messages ? db.messages.size : 0;
      const uptimeSec = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);

      const text = `<b>STATISTIK SERVER FLATIMO MAIL</b>\n` +
        `<blockquote>` +
        `• Status Server: <b>ONLINE (Active)</b>\n` +
        `• Uptime: <b>${hours} Jam ${minutes} Menit</b>\n` +
        `• Total Domain Aktif: <b>${domains.length}</b>\n` +
        `• Total Inbox Terbuat: <b>${inboxes}</b>\n` +
        `• Total Pesan di Database: <b>${messages}</b>\n` +
        `• Port Backend: <b>${config.port}</b>\n` +
        `• Port SMTP: <b>${config.smtpPort}</b>\n` +
        `• Retensi Email: <b>${db.getSettings().retentionHours || 24} Jam</b>` +
        `</blockquote>`;

      return await editMessage(chatId, messageId, text, getCancelKeyboard());
    }
  }

  // 2. Handle Text Messages (Always In-Place Timpa/Edit and delete typed input for clean session)
  if (update.message && update.message.text) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const userMsgId = msg.message_id;
    const strChatId = String(chatId);
    let isAdmin = authenticatedAdmins.has(strChatId);

    // Always delete user typed input message to maintain clean chat interface
    await deleteMessage(chatId, userMsgId);

    const session = userSessions.get(chatId) || {};

    // 2.1 Check PIN Input
    if (session.state === 'AWAITING_ADMIN_PIN') {
      const currentAdminPin = String(db.getSettings().adminBotPassword || db.getSettings().settingsPassword || '2103').trim();
      
      if (text === currentAdminPin) {
        authenticatedAdmins.add(strChatId);
        const successText = `<b>PIN VALID - AKSES ADMIN DITERIMA</b>\n<blockquote>Selamat datang di Panel Kontrol Admin Flatimo Mail.\nStatus: Terautentikasi Penuh (VIP Admin)</blockquote>\n\nSilakan pilih menu manajemen di bawah:`;
        return await sendOrEditSessionMessage(chatId, successText, getAdminMenuKeyboard(), null);
      } else {
        const wrongText = `<b>PIN SALAH!</b>\n<blockquote>PIN yang Anda masukkan tidak sesuai. Silakan ketik PIN yang benar atau klik tombol di bawah untuk batal:</blockquote>`;
        return await sendOrEditSessionMessage(chatId, wrongText, getCancelKeyboard(), 'AWAITING_ADMIN_PIN');
      }
    }

    // 2.2 Command /admin
    if (text === '/admin') {
      if (isAdmin) {
        const textAdmin = `<b>PANEL KONTROL ADMIN FLATIMO MAIL</b>\n<blockquote>Silakan pilih menu manajemen yang tersedia di bawah:</blockquote>`;
        return await sendOrEditSessionMessage(chatId, textAdmin, getAdminMenuKeyboard(), null);
      } else {
        const pinText = `<b>AKSES KHUSUS PANEL ADMIN</b>\n<blockquote>Silakan ketik 4 digit PIN / Password Admin untuk membuka panel kontrol admin:</blockquote>`;
        return await sendOrEditSessionMessage(chatId, pinText, getCancelKeyboard(), 'AWAITING_ADMIN_PIN');
      }
    }

    // 2.3 Command /start or /menu
    if (text === '/start' || text === '/menu') {
      const greeting = isAdmin 
        ? `<b>PANEL KONTROL ADMIN FLATIMO MAIL</b>\n<blockquote>Selamat datang di sistem manajemen Flatimo Mail. Silakan pilih menu di bawah:</blockquote>`
        : `<b>FLATIMO MAIL - SISTEM EMAIL SEMENTARA</b>\n<blockquote>Layanan email sementara mandiri. Gunakan menu di bawah untuk memeriksa kotak masuk email dan menerima kode verifikasi / OTP secara real-time.</blockquote>`;

      return await sendOrEditSessionMessage(chatId, greeting, getMainMenuKeyboard(chatId), null);
    }

    // 2.4 Command /inbox <email> or state AWAITING_INBOX_QUERY
    if (text.startsWith('/inbox') || session.state === 'AWAITING_INBOX_QUERY') {
      const queryEmail = text.startsWith('/inbox') 
        ? text.replace('/inbox', '').trim().toLowerCase() 
        : text.toLowerCase().trim();

      if (!queryEmail || !queryEmail.includes('@')) {
        const errText = `<b>FORMAT ALAMAT EMAIL TIDAK VALID</b>\n<blockquote>Harap ketik alamat email lengkap yang benar.\nContoh: <code>user123@mailflatimo.web.id</code></blockquote>`;
        return await sendOrEditSessionMessage(chatId, errText, getCancelKeyboard(), 'AWAITING_INBOX_QUERY');
      }

      const messages = db.getMessages(queryEmail);

      if (!messages || messages.length === 0) {
        const emptyText = `<b>KOTAK MASUK KOSONG</b>\n<blockquote>Tidak ada pesan masuk untuk alamat: <code>${queryEmail}</code>.\n\nKirim email ke alamat tersebut untuk melihat pesan secara real-time.</blockquote>`;
        return await sendOrEditSessionMessage(chatId, emptyText, getCancelKeyboard(), null);
      }

      let latestHighlight = '';
      if (messages[0]?.otp || messages[0]?.code) {
        latestHighlight = `\n• <b>OTP Terbaru:</b> <code>${messages[0].otp || messages[0].code}</code>`;
      } else if (messages[0]?.verification_link) {
        latestHighlight = `\n• <b>Link Verifikasi:</b> <a href="${messages[0].verification_link}">Klik Link Verifikasi</a>`;
      }

      let inboxListText = `<b>DAFTAR PESAN MASUK</b>\n` +
        `<blockquote>` +
        `• <b>Kotak Masuk:</b> <code>${queryEmail}</code>\n` +
        `• <b>Total Pesan:</b> <b>${messages.length}</b>` +
        latestHighlight +
        `</blockquote>\n\n` +
        `Pilih pesan di bawah untuk membaca isi lengkap:`;

      const buttons = messages.slice(0, 8).map((m, idx) => {
        const sender = m.from?.name || m.from?.address || 'Unknown';
        const subj = m.subject ? (m.subject.length > 20 ? m.subject.substring(0, 20) + '...' : m.subject) : '(Tanpa Subjek)';
        const otpBadge = (m.otp || m.code) ? `[OTP: ${m.otp || m.code}] ` : (m.verification_link ? `[LINK] ` : '');
        const btnStyle = (m.otp || m.code || m.verification_link) ? 'success' : 'primary';
        return [
          { text: `${idx + 1}. ${otpBadge}${subj}`, callback_data: `read_full_${m.id}`, style: btnStyle }
        ];
      });

      buttons.push([
        { text: 'Buka di Web', url: `https://mailflatimo.web.id/inbox/${encodeURIComponent(queryEmail)}`, style: 'primary' },
        { text: 'Kembali ke Menu', callback_data: 'cancel_action', style: 'danger' }
      ]);

      return await sendOrEditSessionMessage(chatId, inboxListText, { inline_keyboard: buttons }, null);
    }

    // 2.5 Process Domain Input from Admin (Instant Add)
    if (session.state === 'AWAITING_ADMIN_DOMAIN' && isAdmin) {
      const cleanDomain = text.toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/$/, '').replace(/^@/, '').trim();

      if (!cleanDomain.includes('.') || cleanDomain.length < 3) {
        const errorText = `<b>FORMAT DOMAIN TIDAK VALID</b>\n<blockquote>Harap ketik nama domain yang benar.\nContoh: <code>domainku.com</code></blockquote>`;
        return await sendOrEditSessionMessage(chatId, errorText, getCancelKeyboard(), 'AWAITING_ADMIN_DOMAIN');
      }

      db.addDomain(cleanDomain);
      domainWatchers.set(cleanDomain, chatId);

      const resText = `<b>DOMAIN BERHASIL DITAMBAHKAN</b>\n` +
        `<blockquote>` +
        `Domain <code>${cleanDomain}</code> telah didaftarkan ke sistem dan langsung aktif di dropdown website.\n\n` +
        `Kotak Uji Coba: <code>test@${cleanDomain}</code>` +
        `</blockquote>`;
      
      return await sendOrEditSessionMessage(chatId, resText, getAdminMenuKeyboard(), null);
    }

    // 2.6 Default Fallback (Clean Session)
    const fallbackText = isAdmin 
      ? `<b>PANEL KONTROL ADMIN FLATIMO MAIL</b>\n<blockquote>Silakan pilih menu manajemen yang tersedia di bawah:</blockquote>`
      : `<b>FLATIMO MAIL - SISTEM EMAIL SEMENTARA</b>\n<blockquote>Layanan email sementara mandiri. Gunakan menu di bawah untuk memeriksa kotak masuk email dan menerima kode verifikasi / OTP secara real-time.</blockquote>`;

    return await sendOrEditSessionMessage(chatId, fallbackText, getMainMenuKeyboard(chatId), null);
  }
}

// Long Polling Runner
let lastUpdateId = 0;
let isPolling = false;

export function startTelegramBot() {
  if (isPolling) return;
  isPolling = true;

  console.log(`[TelegramBot] Initializing Enhanced Real-time Telegram Bot with Quote Styles and Clean Buttons...`);

  async function pollLoop() {
    try {
      const res = await fetch(`${TG_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=25`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      // Network retry backoff
    }

    if (isPolling) {
      setTimeout(pollLoop, 1000);
    }
  }

  pollLoop();
}

