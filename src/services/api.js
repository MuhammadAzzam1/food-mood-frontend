// Keep local storefront and API on the same site so the HttpOnly owner cookie
// is sent back during the session check. Production always uses VITE_API_BASE_URL.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(BASE_URL + path, {
    method: options.method,
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
}

async function uploadProductImage(_token, file) {
  const response = await fetch(BASE_URL + '/owner/product-image', {
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
  return data;
}

export const api = {
  deliveryZones: () => request('/delivery-zones'),
  restaurantSettings: () => request('/restaurant-settings'),
  chat: body => request('/chat', { method: 'POST', body }),
  customerOrder: sessionId => request('/customer/orders/' + encodeURIComponent(sessionId)),
  categories: () => request('/categories'),
  products: categoryId => request('/products' + (categoryId ? '?category_id=' + encodeURIComponent(categoryId) : '')),
  product: id => request('/products/' + id),
  cart: sessionId => request('/cart/' + encodeURIComponent(sessionId)),
  addCartItem: (sessionId, body) => request('/cart/' + encodeURIComponent(sessionId) + '/items', { method: 'POST', body }),
  updateCartItem: (sessionId, variantId, body) => request('/cart/' + encodeURIComponent(sessionId) + '/items/' + encodeURIComponent(variantId), { method: 'PATCH', body }),
  removeCartItem: (sessionId, variantId) => request('/cart/' + encodeURIComponent(sessionId) + '/items/' + encodeURIComponent(variantId), { method: 'DELETE' }),
  clearCart: sessionId => request('/cart/' + encodeURIComponent(sessionId), { method: 'DELETE' }),
  checkout: body => request('/checkout', { method: 'POST', body }),
  paymentReference: body => request('/payment_referance', { method: 'POST', body }),
  login: body => request('/admin/login', { method: 'POST', body }),
  session: () => request('/admin/session'),
  logout: () => request('/admin/logout', { method: 'POST' }),
  updateAccount: (_token, body) => request('/owner/account', { method: 'PUT', body }),
  uploadProductImage,
  verifyPayment: (_token, order_id) => request('/verify-payment', { method: 'POST', body: { order_id } }),
  orders: () => request('/owner/orders'),
  catalog: () => request('/owner/catalog'),
  createCategory: (_token, body) => request('/owner/categories', { method: 'POST', body }),
  updateCategory: (_token, id, body) => request('/owner/categories/' + id, { method: 'PUT', body }),
  setCategoryActive: (_token, id, active) => request('/owner/categories/' + id + '/active?active=' + active, { method: 'PUT' }),
  createProduct: (_token, body) => request('/owner/products', { method: 'POST', body }),
  updateProduct: (_token, id, body) => request('/owner/products/' + id, { method: 'PUT', body }),
  setProductActive: (_token, id, active) => request('/owner/products/' + id + '/active?active=' + active, { method: 'PUT' }),
  createDeliveryZone: (_token, body) => request('/owner/delivery-zones', { method: 'POST', body }),
  updateDeliveryZone: (_token, id, body) => request('/owner/delivery-zones/' + id, { method: 'PUT', body }),
  updateSettings: (_token, settings) => request('/owner/settings', { method: 'PUT', body: { settings } }),
  auditEvents: () => request('/owner/audit-events'),
  order: (_token, id) => request('/owner/orders/' + id),
  updateStatus: (_token, body) => request('/owner/orders/status', { method: 'PUT', body }),
};

export const getError = error => error?.message || 'Please check your connection and try again.';
