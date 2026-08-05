const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message = payload?.error || payload?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function getAuthStatus() {
  try {
    return await request('/auth/status', { method: 'GET' });
  } catch (err) {
    return {
      backendAvailable: false,
      authenticated: false,
      firstRun: false,
      passkeyRegistered: false,
      error: err.message,
    };
  }
}

export async function bootstrapAccount({ username, displayName, password }) {
  return request('/auth/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ username, displayName, password }),
  });
}

export async function login({ username, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function logout() {
  try {
    return await request('/auth/logout', { method: 'POST' });
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  return request('/auth/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function beginPasskeyRegistration() {
  return request('/auth/webauthn/register/options', { method: 'POST' });
}

export async function completePasskeyRegistration(attestationResponse) {
  return request('/auth/webauthn/register/verify', {
    method: 'POST',
    body: JSON.stringify({ attestationResponse }),
  });
}

export async function beginPasskeyLogin() {
  return request('/auth/webauthn/login/options', { method: 'POST' });
}

export async function completePasskeyLogin(authenticationResponse) {
  return request('/auth/webauthn/login/verify', {
    method: 'POST',
    body: JSON.stringify({ authenticationResponse }),
  });
}

export async function fetchRemoteState() {
  try {
    const data = await request('/state', { method: 'GET' });
    return data?.state || null;
  } catch {
    return null;
  }
}

export async function saveRemoteState(state) {
  try {
    return await request('/state', {
      method: 'PUT',
      body: JSON.stringify({ state }),
    });
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function resetRemoteState() {
  try {
    return await request('/state/reset', { method: 'POST' });
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
