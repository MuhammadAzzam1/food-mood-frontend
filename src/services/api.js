// Keep local storefront and API on the same site so the HttpOnly owner cookie
// is sent back during the session check. Production always uses VITE_API_BASE_URL.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');


async function request(path, options = {}) {
  const method = options.method || 'GET';
  // A serverless API can briefly be unavailable while waking up. Safe reads
  // get two short retries; writes are never repeated to avoid duplicate orders.
  const attempts = method === 'GET' ? 3 : 1;
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = data?.detail;
        const message = typeof detail === 'string' ? detail : detail?.message || data?.message || 'Something went wrong.';
        const error = new Error(message);
        error.status = response.status;
        error.detail = detail;
        throw error;
      }
      return data;
    } catch (error) {
      lastError = error;
      const canRetry = !error.status || error.status >= 500;
      if (!canRetry || attempt === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw lastError;
}

async function uploadProductImage(_token, file) {
  const response = await fetch(`${BASE_URL}/owner/product-image`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'X-Upload-Filename': file.name, 'X-Upload-Content-Type': file.type },
    body: file,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(typeof data?.detail === 'string' ? data.detail : 'Image upload failed.');
    error.status = response.status;
    throw error;
  }
