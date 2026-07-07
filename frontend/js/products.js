// ============================================
// SHOPNOVA — Products Page JS
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  let currentPage = 1, totalPages = 1;
  let filters = { category: [], sort: 'newest', search: '', minPrice: 0, maxPrice: 3000 };

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('search'))   filters.search   = params.get('search');
  if (params.get('category')) filters.category = [params.get('category')];

  async function loadProducts() {
    const grid    = document.getElementById('prod-grid');
    const countEl = document.getElementById('prod-count');
    if (!grid) return;

    // Skeletons
    grid.innerHTML = Array(8).fill(0).map(() => `
      <div class="col-md-6 col-xl-4 mb-4">
        <div class="skel" style="height:380px;border-radius:16px"></div>
      </div>`).join('');

    try {
      // Build query params
      const params = new URLSearchParams();
      params.set('page',  currentPage);
      params.set('limit', 12);
      params.set('sort',  filters.sort);
      if (filters.search)   params.set('search',   filters.search);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);

      // Fix catégorie : prend la première sélectionnée
      if (filters.category.length > 0) {
        params.set('category', filters.category[0]);
      }

      const data = await window.SN.fetch(`/products?${params.toString()}`);
      totalPages = data.totalPages;

      if (countEl) countEl.textContent = `${data.total} products found`;

      if (!data.products || !data.products.length) {
        grid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div style="font-size:3.5rem;margin-bottom:16px">🔍</div>
            <h5 style="color:var(--text-2)">No products found</h5>
            <p style="color:var(--text-3)">Try adjusting your filters</p>
            <button class="btn-gp mt-3" onclick="clearFilters()">Clear Filters</button>
          </div>`;
        return;
      }

      grid.innerHTML = data.products.map(p => buildCard(p)).join('');
      renderPagination();

    } catch (err) {
      console.error('Load error:', err);
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p style="color:var(--danger)">❌ Error: ${err.message}</p>
          <p style="color:var(--text-3);font-size:0.82rem">Make sure backend is running on port 5000</p>
        </div>`;
    }
  }
  function buildCard(p) {
    const img = p.images?.[0] || `https://via.placeholder.com/400x300/7C3AED/ffffff?text=${encodeURIComponent(p.name)}`;
    const disc = p.discountPercent || (p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
    return `
      <div class="col-md-6 col-xl-4 mb-4">
        <div class="prod-card h-100" style="animation:scaleIn 0.4s ease both">
          <div class="prod-img-box">
            <img src="${img}" alt="${p.name}" loading="lazy"
              onerror="this.src='https://via.placeholder.com/400x300/7C3AED/ffffff?text=${encodeURIComponent(p.name)}'">
            ${p.featured ? '<span class="p-badge"> Featured</span>' : ''}
            ${disc > 0 && p.featured ? `<span class="p-badge-sale">-${disc}%</span>` : disc > 0 ? `<span class="p-badge-sale-only">-${disc}%</span>` : ''}
            <div class="prod-acts">
              <a href="product-detail.html?id=${p._id}" class="act-btn" title="View Details">👁</a>
              <button class="act-btn" onclick="wishlistToggle('${p._id}')" title="Wishlist">🤍</button>
            </div>
          </div>
          <div class="prod-body">
            <div class="p-cat">${p.category}</div>
            <div class="p-name">${p.name}</div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="p-stars">${window.SN.stars(p.ratings || 0)}</span>
              <span class="p-rc">(${p.numReviews || 0})</span>
            </div>
            <div class="p-price">
              <span class="p-price-cur">$${p.price.toFixed(2)}</span>
              ${p.originalPrice ? `<span class="p-price-orig">$${p.originalPrice.toFixed(2)}</span>` : ''}
              ${disc > 0 ? `<span class="p-disc">-${disc}%</span>` : ''}
            </div>
            <button class="btn-cart" onclick="addToCart('${p._id}')" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.stock === 0 ? ' Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>
        </div>
      </div>`;
  }

  function renderPagination() {
    const pag = document.getElementById('pagination');
    if (!pag || totalPages <= 1) { if (pag) pag.innerHTML = ''; return; }
    let h = `<nav><ul class="pagination justify-content-center flex-wrap" style="gap:6px">`;
    h += `<li class="page-item ${currentPage===1?'disabled':''}">
            <button class="page-link" onclick="goPage(${currentPage-1})" style="background:var(--glass);border:1px solid var(--glass-border);color:#fff;border-radius:8px">‹</button></li>`;
    for (let i = 1; i <= totalPages; i++) {
      h += `<li class="page-item ${i===currentPage?'active':''}">
              <button class="page-link" onclick="goPage(${i})"
                style="background:${i===currentPage?'var(--primary)':'var(--glass)'};border:1px solid ${i===currentPage?'var(--primary)':'var(--glass-border)'};color:#fff;border-radius:8px">${i}</button></li>`;
    }
    h += `<li class="page-item ${currentPage===totalPages?'disabled':''}">
            <button class="page-link" onclick="goPage(${currentPage+1})" style="background:var(--glass);border:1px solid var(--glass-border);color:#fff;border-radius:8px">›</button></li>`;
    h += `</ul></nav>`;
    pag.innerHTML = h;
  }

  window.goPage = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    currentPage = p;
    loadProducts();
    document.getElementById('prod-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  window.clearFilters = () => {
    filters = { category: [], sort: 'newest', search: '', minPrice: 0, maxPrice: 3000 };
    currentPage = 1;
    document.querySelectorAll('.f-check input').forEach(i => i.checked = false);
    document.getElementById('sort-sel').value   = 'newest';
    document.getElementById('price-range').value = 3000;
    document.getElementById('max-price-val').textContent = '$3000';
    loadProducts();
  };

  window.addToCart = async (id) => {
    if (!window.SN.token()) { window.location.href = `login.html?redirect=products.html`; return; }
    try {
      const data = await window.SN.fetch('/cart/add', { method: 'POST', body: JSON.stringify({ productId: id, quantity: 1 }) });
      const count = data.cart.items.reduce((s, i) => s + i.quantity, 0);
      window.SN.setCartCount(count);
      window.SN.toast('Added to cart! 🛒', 's');
    } catch (e) { window.SN.toast(e.message, 'e'); }
  };

  window.wishlistToggle = (id) => {
    window.SN.toast('Added to wishlist! 💜', 's');
  };

  // Filter listeners
  document.querySelectorAll('.f-check input').forEach(inp => {
    inp.addEventListener('change', () => {
      filters.category = [...document.querySelectorAll('.f-check input:checked')].map(i => i.value);
      currentPage = 1; loadProducts();
    });
  });

  const sortSel = document.getElementById('sort-sel');
  sortSel?.addEventListener('change', () => { filters.sort = sortSel.value; currentPage = 1; loadProducts(); });

  const priceRange = document.getElementById('price-range');
  priceRange?.addEventListener('input', () => {
    filters.maxPrice = Number(priceRange.value);
    document.getElementById('max-price-val').textContent = `$${priceRange.value}`;
  });
  priceRange?.addEventListener('change', () => { currentPage = 1; loadProducts(); });

  // Search input
  const searchIn = document.getElementById('prod-search');
  if (searchIn) {
    searchIn.value = filters.search;
    let dt;
    searchIn.addEventListener('input', () => {
      clearTimeout(dt);
      dt = setTimeout(() => { filters.search = searchIn.value; currentPage = 1; loadProducts(); }, 450);
    });
  }

  // Init
  loadProducts();
});