const BASE_URL = '/api/v1';

const defaultHeaders = {
  'X-Client-App': 'flatimo-web'
};

export async function fetchAuthStatus() {
  try {
    const res = await fetch(`${BASE_URL}/auth/status`, { headers: defaultHeaders });
    return await res.json();
  } catch (e) {
    return { success: false, isPasswordProtected: false };
  }
}

export async function fetchPopupConfig() {
  try {
    const res = await fetch(`${BASE_URL}/popup`, { headers: defaultHeaders });
    return await res.json();
  } catch (e) {
    return { success: false, popupEnabled: false };
  }
}

export async function verifyPassword(password) {
  const res = await fetch(`${BASE_URL}/auth/verify-password`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return await res.json();
}

export async function verifySettingsPin(pin) {
  const res = await fetch(`${BASE_URL}/settings/verify-pin`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  });
  return await res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${BASE_URL}/settings`, { headers: defaultHeaders });
  return await res.json();
}

export async function updateSettings(settings) {
  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return await res.json();
}

export async function fetchDomains() {
  const res = await fetch(`${BASE_URL}/domains`, { headers: defaultHeaders });
  return await res.json();
}

export async function addDomain(domain) {
  const res = await fetch(`${BASE_URL}/domains`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ domain }),
  });
  return await res.json();
}

export async function deleteDomain(domain) {
  const res = await fetch(`${BASE_URL}/domains/${encodeURIComponent(domain)}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  return await res.json();
}

export async function generateInbox(domain = '') {
  const url = domain ? `${BASE_URL}/inbox/generate?domain=${encodeURIComponent(domain)}` : `${BASE_URL}/inbox/generate`;
  const res = await fetch(url, { headers: defaultHeaders });
  return await res.json();
}

export async function createCustomInbox(username, domain) {
  const res = await fetch(`${BASE_URL}/inbox/create`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, domain }),
  });
  return await res.json();
}

export async function fetchMessages(email) {
  const res = await fetch(`${BASE_URL}/inbox/${encodeURIComponent(email)}/messages`, { headers: defaultHeaders });
  return await res.json();
}

export async function fetchMessageDetail(id) {
  const res = await fetch(`${BASE_URL}/messages/${id}`, { headers: defaultHeaders });
  return await res.json();
}

export async function deleteMessage(id) {
  const res = await fetch(`${BASE_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  return await res.json();
}

export async function deleteInbox(email) {
  const res = await fetch(`${BASE_URL}/inbox/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: defaultHeaders
  });
  return await res.json();
}

export async function sendTestEmail(payload) {
  const res = await fetch(`${BASE_URL}/test-email`, {
    method: 'POST',
    headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`, { headers: defaultHeaders });
  return await res.json();
}

