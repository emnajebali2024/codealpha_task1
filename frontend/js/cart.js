// ============================================
// SHOPNOVA — Cart & Checkout JS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  /* ─── CART PAGE ─── */
  if (page === 'cart') {
    if (!window.SN.token()) { window.location.href = 'login.html?redirect=cart.html'; return; }

    async function loadCart() {
      const list = document.getElementById('cart-list');
      const summaryItems = document.getElementById('summary-items');
      if (!list) return;
      list.innerHTML = '<div class="text-center py-5" style="color:var(--text-2)">⏳ Loading cart...</div>';

      try {
        const { cart } = await window.SN.fetch('/cart');
        window.SN.setCartCount(cart.items.reduce((s, i) => s + i.quantity, 0));

        if (!cart.items.length) {
          list.innerHTML = `
            <div class="text-center py-5">
              <div style="font-size:4rem;margin-bottom:16px">🛒</div>
              <h5 style="color:var(--text-2)">Your cart is empty</h5>
              <a href="products.html" class="btn-gp mt-3">Start Shopping</a>
            </div>`;
          return;
        }

        list.innerHTML = cart.items.map(i => {
          // Fix : i.product peut être un objet populé ou un string ID
          const productId = i.product?._id || i.product;
          return `
          <div class="cart-item mb-3">
            <img src="${i.image || 'https://via.placeholder.com/80'}" alt="${i.name}" class="ci-img"
              onerror="this.src='https://via.placeholder.com/80/7C3AED/fff?text=IMG'">
            <div class="flex-grow-1">
              <div style="font-weight:700;color:#fff;margin-bottom:4px">${i.name}</div>
              <div style="font-size:0.82rem;color:var(--text-3)">Unit: $${i.price.toFixed(2)}</div>
              <div class="qty-box mt-2">
                <button class="qty-btn" onclick="updateItem('${productId}', ${i.quantity - 1})">−</button>
                <span class="qty-val">${i.quantity}</span>
                <button class="qty-btn" onclick="updateItem('${productId}', ${i.quantity + 1})">+</button>
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:800;color:#fff;font-size:1rem">$${(i.price * i.quantity).toFixed(2)}</div>
              <button onclick="removeItem('${productId}')" 
                style="background:none;border:none;color:var(--danger);font-size:0.8rem;margin-top:6px;cursor:pointer">
                ✕ Remove
              </button>
            </div>
          </div>`;
        }).join('');

        // Summary
        const sub   = cart.totalPrice;
        const ship  = sub >= 100 ? 0 : 7.99;
        const tax   = (sub * 0.08);
        const total = sub + ship + tax;

        if (summaryItems) {
          summaryItems.innerHTML = `
            <div class="sum-row"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
            <div class="sum-row"><span>Shipping</span><span>${ship === 0 ? '<span class="free-ship">FREE</span>' : '$' + ship.toFixed(2)}</span></div>
            <div class="sum-row"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
            <hr style="border-color:var(--glass-border)">
            <div class="sum-row"><span class="sum-total">Total</span><span class="sum-total">$${total.toFixed(2)}</span></div>
            ${sub < 100 ? `<div class="mt-2" style="font-size:0.78rem;color:var(--text-3)">Add $${(100-sub).toFixed(2)} more for free shipping!</div>` : ''}`;
        }
      } catch (err) {
        list.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
      }
    }

    window.updateItem = async (productId, qty) => {
      if (qty < 0) return;
      try {
        await window.SN.fetch('/cart/update', { method: 'PUT', body: JSON.stringify({ productId, quantity: qty }) });
        await loadCart();
      } catch (e) { window.SN.toast(e.message, 'e'); }
    };

    window.removeItem = async (productId) => {
      try {
        await window.SN.fetch(`/cart/remove/${productId}`, { method: 'DELETE' });
        window.SN.toast('Item removed', 'i');
        await loadCart();
      } catch (e) { window.SN.toast(e.message, 'e'); }
    };

    window.clearCart = async () => {
      if (!confirm('Clear all items?')) return;
      await window.SN.fetch('/cart/clear', { method: 'DELETE' });
      window.SN.setCartCount(0);
      loadCart();
    };

    loadCart();
  }

  /* ─── CHECKOUT PAGE ─── */
  if (page === 'checkout') {
    if (!window.SN.token()) { window.location.href = 'login.html?redirect=checkout.html'; return; }

    // Auto-fill from profile
    const u = window.SN.user();
    if (u) {
      const nameEl = document.getElementById('full-name');
      if (nameEl) nameEl.value = u.name;
    }

    const form = document.getElementById('checkout-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('order-btn');
      btn.disabled    = true;
      btn.textContent = '⏳ Processing...';

      const shippingAddress = {
        fullName: document.getElementById('full-name').value,
        address:  document.getElementById('address').value,
        city:     document.getElementById('city').value,
        state:    document.getElementById('state').value || '',
        zipCode:  document.getElementById('zip').value   || '',
        country:  document.getElementById('country').value || 'Tunisia',
        phone:    document.getElementById('phone').value  || ''
      };
      const paymentMethod = document.querySelector('input[name=payment]:checked')?.value || 'cash';
      const notes         = document.getElementById('notes')?.value || '';

      try {
        const data = await window.SN.fetch('/orders', {
          method: 'POST',
          body: JSON.stringify({ shippingAddress, paymentMethod, notes })
        });
        window.SN.setCartCount(0);
        window.SN.toast('🎉 Order placed successfully!', 's', 5000);
        setTimeout(() => window.location.href = `orders.html`, 1500);
      } catch (err) {
        window.SN.toast(err.message, 'e');
        btn.disabled    = false;
        btn.textContent = '✅ Place Order';
      }
    });
  }

  /* ─── ORDERS PAGE ─── */
  if (page === 'orders') {
    if (!window.SN.token()) { window.location.href = 'login.html?redirect=orders.html'; return; }

    async function loadOrders() {
      const wrap = document.getElementById('orders-wrap');
      if (!wrap) return;
      wrap.innerHTML = '<div class="text-center py-5" style="color:var(--text-2)">⏳ Loading orders...</div>';

      try {
        const { orders } = await window.SN.fetch('/orders/my-orders');
        if (!orders.length) {
          wrap.innerHTML = `
            <div class="text-center py-5">
              <div style="font-size:4rem;margin-bottom:16px">📦</div>
              <h5 style="color:var(--text-2)">No orders yet</h5>
              <a href="products.html" class="btn-gp mt-3">Start Shopping</a>
            </div>`;
          return;
        }

        const statusClasses = {
          processing: 's-processing', confirmed: 's-confirmed',
          shipped: 's-shipped', delivered: 's-delivered', cancelled: 's-cancelled'
        };

        wrap.innerHTML = orders.map(o => `
          <div class="order-card mb-4">
            <div class="order-head">
              <span style="font-weight:700;color:#fff">Order #${o.orderNumber || o._id.slice(-8).toUpperCase()}</span>
              <span class="status-pill ${statusClasses[o.orderStatus] || ''}">${o.orderStatus}</span>
              <span style="font-size:0.82rem;color:var(--text-3);margin-left:auto">${new Date(o.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</span>
            </div>
            <div style="padding:16px 20px">
              ${o.items.map(i => `
                <div class="d-flex align-items-center gap-12 mb-2" style="gap:14px">
                  <img src="${i.image||'https://via.placeholder.com/50'}" style="width:50px;height:50px;border-radius:8px;object-fit:cover" alt="${i.name}">
                  <div class="flex-grow-1">
                    <div style="font-size:0.875rem;font-weight:600;color:#fff">${i.name}</div>
                    <div style="font-size:0.78rem;color:var(--text-3)">Qty: ${i.quantity} × $${i.price.toFixed(2)}</div>
                  </div>
                  <div style="font-weight:700;color:#fff">$${(i.price*i.quantity).toFixed(2)}</div>
                </div>`).join('')}
              <hr style="border-color:var(--glass-border)">
              <div class="d-flex justify-content-between">
                <span style="color:var(--text-2)">Total Amount</span>
                <span style="font-size:1.1rem;font-weight:800;color:#fff">$${o.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>`).join('');
      } catch (err) {
        wrap.innerHTML = `<p style="color:var(--danger)">Error: ${err.message}</p>`;
      }
    }

    loadOrders();
  }
});