// ============================================
// SHOPNOVA — Main / Shared JS
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ── */
  const nav = document.querySelector('.sn-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* ── Auth UI state ── */
  const user = window.SN.user();
  const guestNav  = document.getElementById('guest-nav');
  const userNav   = document.getElementById('user-nav');
  const userName  = document.getElementById('user-name');
  const userAvt   = document.getElementById('user-avt');

  if (guestNav)  guestNav.style.display  = user ? 'none' : 'flex';
  if (userNav)   userNav.style.display   = user ? 'flex' : 'none';
  if (userName && user) userName.textContent = user.name.split(' ')[0];
  if (userAvt  && user) userAvt.src = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  /* ── Cart badge ── */
  const badge = document.querySelector('.cart-badge');
  const count = window.SN.cartCount();
  if (badge) {
    badge.textContent    = count;
    badge.style.display  = count > 0 ? 'flex' : 'none';
  }

  /* ── Logout ── */
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.SN.clearSession();
      window.SN.setCartCount(0);
      window.location.href = 'index.html';
    });
  });

  /* ── Navbar search ── */
  const navSearch = document.getElementById('nav-search');
  if (navSearch) {
    navSearch.addEventListener('keydown', e => {
      if (e.key === 'Enter' && navSearch.value.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(navSearch.value.trim())}`;
      }
    });
  }
  const navSearchBtn = document.getElementById('nav-search-btn');
  if (navSearchBtn) {
    navSearchBtn.addEventListener('click', () => {
      const q = document.getElementById('nav-search')?.value.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    });
  }

  /* ── Scroll-reveal ── */
  const revEls = document.querySelectorAll('.reveal');
  if (revEls.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
    }, { threshold: 0.1 });
    revEls.forEach(el => obs.observe(el));
  }

  /* ── Counter animation ── */
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString() + suffix;
      if (start >= target) clearInterval(timer);
    }, 22);
  });

  /* ── Update cart count from API if logged in ── */
  if (window.SN.token()) {
    window.SN.fetch('/cart').then(data => {
      const count = data.cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      window.SN.setCartCount(count);
    }).catch(() => {});
  }
});