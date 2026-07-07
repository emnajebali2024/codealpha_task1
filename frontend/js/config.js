// ============================================
// SHOPNOVA — Global Configuration
// ============================================
window.SN = {
  API: 'http://localhost:5000/api',

  // Get auth token
  token: () => localStorage.getItem('sn_token'),

  // Get logged user
  user: () => {
    try { return JSON.parse(localStorage.getItem('sn_user')); }
    catch { return null; }
  },

  // Save session
  setSession: (token, user) => {
    localStorage.setItem('sn_token', token);
    localStorage.setItem('sn_user', JSON.stringify(user));
  },

  // Clear session
  clearSession: () => {
    localStorage.removeItem('sn_token');
    localStorage.removeItem('sn_user');
  },

  // Authenticated fetch
  fetch: async (url, opts = {}) => {
    const token = window.SN.token();
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${window.SN.API}${url}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  },

  // Toast notification
  toast: (msg, type = 's', duration = 3500) => {
    const box = document.getElementById('toast-box');
    if (!box) return;
    const icons = { s: '✓', e: '✕', i: 'ℹ', w: '⚠' };
    const el = document.createElement('div');
    el.className = `toast-item toast-${type}`;
    el.innerHTML = `
      <span class="toast-ico">${icons[type]}</span>
      <span>${msg}</span>`;
    box.appendChild(el);
    requestAnimationFrame(() => { el.classList.add('show'); });
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 350);
    }, duration);
  },

  // Stars renderer
  stars: (r) => {
    const full = Math.floor(r), half = r % 1 >= 0.5;
    let s = '';
    for (let i = 0; i < full; i++) s += '★';
    if (half) s += '½';
    for (let i = Math.ceil(r); i < 5; i++) s += '☆';
    return s;
  },

  // Cart count from localStorage
  cartCount: () => Number(localStorage.getItem('sn_cart_count') || 0),

  setCartCount: (n) => {
    localStorage.setItem('sn_cart_count', n);
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    });
  }
};