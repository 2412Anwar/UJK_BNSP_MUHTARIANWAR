const API_URL = 'http://127.0.0.1:8000/api';

export function getToken() {
  return localStorage.getItem('token') || localStorage.getItem('admin_token');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = result.errors
      ? Object.values(result.errors).flat().join(' ')
      : null;

    throw new Error(
      validationMessage ||
      result.message ||
      'Terjadi kesalahan pada API.'
    );
  }

  return result;
}

export { API_URL };
