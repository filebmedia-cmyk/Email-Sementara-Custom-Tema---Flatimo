import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Play, Book, Code2, Zap, Key, ShieldCheck, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchSettings } from '../utils/api';

export default function ApiDocs() {
  const { primaryColor, secondaryColor, glowEnabled } = useTheme();
  const [langTab, setLangTab] = useState('curl'); // 'curl', 'js', 'python'
  const [apiKey, setApiKey] = useState('FLATIMOSTORE');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testingEndpoint, setTestingEndpoint] = useState(null);

  useEffect(() => {
    async function loadKey() {
      try {
        const res = await fetchSettings();
        if (res.success && res.settings?.apiKey) {
          setApiKey(res.settings.apiKey);
        }
      } catch (e) {}
    }
    loadKey();
  }, []);

  const baseUrl = window.location.origin;

  const endpoints = [
    {
      id: 'verify-key',
      method: 'GET',
      path: `/api/v1/key/verify?key=${apiKey}`,
      title: '0. Verifikasi API Key',
      desc: 'Memvalidasi status lisensi API key dan memeriksa kuota / status VIP.',
      curl: `curl -X GET "${baseUrl}/api/v1/key/verify?key=${apiKey}" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const res = await fetch("${baseUrl}/api/v1/key/verify?key=${apiKey}", {
  headers: { "X-API-Key": "${apiKey}" }
});
const data = await res.json();
console.log("Status Key:", data);`,
      python: `import requests
res = requests.get("${baseUrl}/api/v1/key/verify", 
  headers={"X-API-Key": "${apiKey}"},
  params={"key": "${apiKey}"}
)
print(res.json())`
    },
    {
      id: 'get-domains',
      method: 'GET',
      path: '/api/v1/domains',
      title: '1. Daftar Domain Aktif',
      desc: 'Mengambil seluruh daftar domain yang aktif dan tersedia untuk digunakan.',
      curl: `curl -X GET "${baseUrl}/api/v1/domains" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const res = await fetch("${baseUrl}/api/v1/domains", {
  headers: { "X-API-Key": "${apiKey}" }
});
const data = await res.json();
console.log(data);`,
      python: `import requests
res = requests.get("${baseUrl}/api/v1/domains", headers={"X-API-Key": "${apiKey}"})
print(res.json())`
    },
    {
      id: 'generate-inbox',
      method: 'GET',
      path: '/api/v1/inbox/generate',
      title: '2. Generate Email Acak Instan',
      desc: 'Membuat alamat email sementara acak baru secara otomatis.',
      curl: `curl -X GET "${baseUrl}/api/v1/inbox/generate" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const res = await fetch("${baseUrl}/api/v1/inbox/generate", {
  headers: { "X-API-Key": "${apiKey}" }
});
const inbox = await res.json();
console.log("Email baru:", inbox.email);`,
      python: `import requests
res = requests.get("${baseUrl}/api/v1/inbox/generate", headers={"X-API-Key": "${apiKey}"})
inbox = res.json()
print("Email:", inbox['email'])`
    },
    {
      id: 'create-inbox',
      method: 'POST',
      path: '/api/v1/inbox/create',
      title: '3. Buat Custom Email Inbox',
      desc: 'Membuat alamat email khusus sesuai dengan nama username atau email yang Anda tentukan.',
      curl: `curl -X POST "${baseUrl}/api/v1/inbox/create" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{"username": "developer_test", "domain": "mailflatimo.web.id"}'`,
      js: `const res = await fetch("${baseUrl}/api/v1/inbox/create", {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": "${apiKey}"
  },
  body: JSON.stringify({
    username: "developer_test",
    domain: "mailflatimo.web.id"
  })
});
const result = await res.json();
console.log(result);`,
      python: `import requests
res = requests.post("${baseUrl}/api/v1/inbox/create", 
  headers={"X-API-Key": "${apiKey}"},
  json={
    "username": "developer_test",
    "domain": "mailflatimo.web.id"
  }
)
print(res.json())`
    },
    {
      id: 'get-messages',
      method: 'GET',
      path: '/api/v1/inbox/:email/messages',
      title: '4. Ambil Daftar Pesan Masuk (Auto OTP)',
      desc: 'Mengambil semua email yang masuk pada inbox tertentu lengkap dengan ekstraksi OTP otomatis.',
      curl: `curl -X GET "${baseUrl}/api/v1/inbox/test@mailflatimo.web.id/messages" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const email = "test@mailflatimo.web.id";
const res = await fetch(\`${baseUrl}/api/v1/inbox/\${encodeURIComponent(email)}/messages\`, {
  headers: { "X-API-Key": "${apiKey}" }
});
const data = await res.json();
console.log(\`Total pesan: \${data.total}\`, data.messages);`,
      python: `import requests
email = "test@mailflatimo.web.id"
res = requests.get(f"${baseUrl}/api/v1/inbox/{email}/messages", headers={"X-API-Key": "${apiKey}"})
data = res.json()
print("Pesan:", data.get("messages", []))`
    },
    {
      id: 'get-message-detail',
      method: 'GET',
      path: '/api/v1/messages/:id',
      title: '5. Ambil Detail & Isi Email (HTML/Text)',
      desc: 'Membaca isi lengkap pesan termasuk format HTML, teks polos, headers, dan lampiran.',
      curl: `curl -X GET "${baseUrl}/api/v1/messages/MESSAGE_ID" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const messageId = "L5WxJFdThJyC";
const res = await fetch(\`${baseUrl}/api/v1/messages/\${messageId}\`, {
  headers: { "X-API-Key": "${apiKey}" }
});
const data = await res.json();
console.log("Subjek:", data.message?.subject);
console.log("HTML:", data.message?.html);`,
      python: `import requests
msg_id = "L5WxJFdThJyC"
res = requests.get(f"${baseUrl}/api/v1/messages/{msg_id}", headers={"X-API-Key": "${apiKey}"})
print(res.json())`
    },
    {
      id: 'stream-sse',
      method: 'GET (SSE)',
      path: '/api/v1/inbox/:email/stream',
      title: '6. Real-time Live Stream (Server-Sent Events)',
      desc: 'Menerima notifikasi seketika saat ada email baru masuk tanpa perlu polling berulang.',
      curl: `curl -N "${baseUrl}/api/v1/inbox/test@mailflatimo.web.id/stream" \\
  -H "X-API-Key: ${apiKey}"`,
      js: `const eventSource = new EventSource("${baseUrl}/api/v1/inbox/test@mailflatimo.web.id/stream");
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "NEW_MAIL") {
    console.log("Email Baru Masuk:", data.message.subject);
  }
};`,
      python: `import requests
url = "${baseUrl}/api/v1/inbox/test@mailflatimo.web.id/stream"
with requests.get(url, stream=True, headers={"X-API-Key": "${apiKey}"}) as response:
    for line in response.iter_lines():
        if line:
            print("Event:", line.decode("utf-8"))`
    }
  ];

  const handleCopyCode = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRunTest = async (ep) => {
    setTestingEndpoint(ep.id);
    setTestResponse(null);
    try {
      if (ep.id === 'get-message-detail') {
        const listRes = await fetch('/api/v1/inbox/spark.runner101@mailflatimo.web.id/messages', {
          headers: { 'X-API-Key': apiKey }
        });
        const listData = await listRes.json();
        let targetId = listData.messages?.[0]?.id;

        if (!targetId) {
          const testMsgRes = await fetch('/api/v1/test-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
            body: JSON.stringify({ to: 'spark.runner101@mailflatimo.web.id' })
          });
          const testMsgData = await testMsgRes.json();
          targetId = testMsgData.email?.id || 'sample_msg';
        }

        const res = await fetch(`/api/v1/messages/${targetId}`, {
          headers: { 'X-API-Key': apiKey }
        });
        const data = await res.json();
        setTestResponse({ endpoint: ep.id, status: res.status, data });
        return;
      }

      let url = ep.path.replace(':email', 'spark.runner101@mailflatimo.web.id');
      if (ep.method.startsWith('GET') && !ep.method.includes('SSE')) {
        const res = await fetch(url, {
          headers: { 'X-API-Key': apiKey }
        });
        const data = await res.json();
        setTestResponse({ endpoint: ep.id, status: res.status, data });
      } else if (ep.method === 'POST') {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ username: 'api_test_user', domain: 'mailflatimo.web.id' })
        });
        const data = await res.json();
        setTestResponse({ endpoint: ep.id, status: res.status, data });
      }
    } catch (err) {
      setTestResponse({ endpoint: ep.id, status: 'ERROR', data: { error: err.message } });
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 sm:mt-6 px-1 sm:px-0 animate-in fade-in duration-300">
      
      {/* Header Banner - 100% Solid Pure Black Opaque Container */}
      <div 
        className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border mb-6 shadow-2xl"
        style={{
          backgroundColor: '#000000',
          borderColor: `${primaryColor}40`,
          boxShadow: `0 10px 30px rgba(0,0,0,0.9), 0 0 25px ${primaryColor}20`
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div 
                className="p-2 rounded-xl border group"
                style={{
                  backgroundColor: '#0a0a0f',
                  borderColor: `${primaryColor}50`,
                  color: primaryColor
                }}
              >
                <Terminal className="w-5 h-5 icon-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Dokumentasi Public REST API</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Integrasikan layanan email sementara dengan bot CapCut, TikTok, Python scripts, Node.js, atau aplikasi eksternal Anda.
            </p>
          </div>

          <div 
            className="flex items-center gap-2 p-3 rounded-2xl border"
            style={{ 
              backgroundColor: '#08080c',
              borderColor: `${primaryColor}35` 
            }}
          >
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                Universal API Key
              </span>
              <span className="font-mono font-bold text-sm text-white">{apiKey}</span>
            </div>
            <button
              onClick={handleCopyApiKey}
              className="group p-2 rounded-xl border border-slate-700 hover:text-white text-slate-400 transition-all"
              style={{ backgroundColor: '#14141d' }}
            >
              {copiedKey ? <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" /> : <Copy className="w-4 h-4 icon-interactive group-hover:scale-125" />}
            </button>
          </div>
        </div>
      </div>

      {/* Endpoints List - 100% Solid Pure Black Cards */}
      <div className="space-y-6">
        {endpoints.map((ep, idx) => (
          <div 
            key={ep.id}
            className="rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: '#000000',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.85)'
            }}
          >
            {/* Solid Card Header Bar */}
            <div 
              className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{
                backgroundColor: '#090a0f',
                borderColor: 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border"
                    style={{
                      backgroundColor: `${primaryColor}15`,
                      borderColor: `${primaryColor}35`,
                      color: primaryColor
                    }}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-slate-200">{ep.path}</span>
                </div>
                <h3 className="text-base font-bold text-white">{ep.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{ep.desc}</p>
              </div>

              {/* Test Button */}
              {!ep.method.includes('SSE') && (
                <button
                  onClick={() => handleRunTest(ep)}
                  disabled={testingEndpoint === ep.id}
                  className="group flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-dark-950 transition-all active:scale-95 shadow-md self-start sm:self-auto shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                  }}
                >
                  <Play className="w-3.5 h-3.5 fill-dark-950 icon-interactive group-hover:scale-125 group-hover:translate-x-0.5" />
                  <span>{testingEndpoint === ep.id ? 'Memproses...' : 'Uji Endpoint'}</span>
                </button>
              )}
            </div>

            {/* Code Snippet Tabs & Solid Pure Black Code Block */}
            <div 
              className="p-4 sm:p-6"
              style={{ backgroundColor: '#000000' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="flex items-center gap-1 p-1 rounded-xl border"
                  style={{ 
                    backgroundColor: '#07070a',
                    borderColor: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {['curl', 'js', 'python'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLangTab(l)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        langTab === l ? 'text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                      style={langTab === l ? { backgroundColor: '#1a1a24' } : {}}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopyCode(ep[langTab], idx)}
                  className="group flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in" /> : <Copy className="w-3.5 h-3.5 icon-interactive group-hover:scale-125" />}
                  <span>{copiedIndex === idx ? 'Disalin' : 'Salin Kode'}</span>
                </button>
              </div>

              <pre 
                className="p-4 rounded-xl border font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed"
                style={{
                  backgroundColor: '#050508',
                  borderColor: 'rgba(255, 255, 255, 0.1)'
                }}
              >
                {ep[langTab]}
              </pre>

              {/* Test Response Output */}
              {testResponse && testResponse.endpoint === ep.id && (
                <div 
                  className="mt-4 p-4 rounded-xl border shadow-inner"
                  style={{
                    backgroundColor: '#050508',
                    borderColor: 'rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 icon-pulse" />
                      <span>Hasil Respon (HTTP {testResponse.status}):</span>
                    </span>
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                    {JSON.stringify(testResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
