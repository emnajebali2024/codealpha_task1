// ============================================
// SHOPNOVA — Auth (Login & Register)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  /* ─── REGISTER ─── */
  if (page === 'register') {
    if (window.SN.user()) { window.location.href = 'index.html'; return; }

    const form  = document.getElementById('reg-form');
    const pwdIn = document.getElementById('reg-pwd');
    const eyeBtn= document.getElementById('pwd-eye');

    // Password toggle
    eyeBtn?.addEventListener('click', () => {
      pwdIn.type = pwdIn.type === 'password' ? 'text' : 'password';
      eyeBtn.textContent = pwdIn.type === 'password' ? '👁' : '🙈';
    });

    // Password strength
    pwdIn?.addEventListener('input', () => {
      const bar = document.getElementById('pwd-bar');
      const txt = document.getElementById('pwd-txt');
      const v   = pwdIn.value;
      const lvl = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, v.length >= 8].filter(x => typeof x === 'boolean' ? x : x.test(v)).length;
      const colors = ['', '#EF4444','#F59E0B','#10B981','#10B981','#7C3AED'];
      const labels = ['','Weak','Fair','Good','Strong','Excellent'];
      if (bar) { bar.style.width = `${lvl * 20}%`; bar.style.background = colors[lvl]; }
      if (txt) { txt.textContent = labels[lvl]; txt.style.color = colors[lvl]; }
    });

    // Submit
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const name  = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const pwd   = pwdIn.value;
      const btn   = document.getElementById('reg-btn');
      const err   = document.getElementById('reg-err');

      if (!name || !email || !pwd) { err.textContent = '⚠ All fields are required'; err.classList.add('d-block'); return; }
      if (pwd.length < 6) { err.textContent = '⚠ Password must be at least 6 characters'; err.classList.add('d-block'); return; }
      if (!document.getElementById('reg-terms').checked) { err.textContent = '⚠ Please accept the terms'; err.classList.add('d-block'); return; }

      err.classList.remove('d-block');
      btn.disabled = true;
      btn.textContent = '⏳ Creating account...';

      try {
        const data = await window.SN.fetch('/auth/register', {
          method: 'POST', body: JSON.stringify({ name, email, password: pwd })
        });
        window.SN.setSession(data.token, data.user);
        window.SN.toast('🎉 Welcome to ShopNova!', 's');
        setTimeout(() => window.location.href = 'index.html', 1200);
      } catch (ex) {
        err.textContent = '⚠ ' + ex.message;
        err.classList.add('d-block');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  }

  /* ─── LOGIN ─── */
  if (page === 'login') {
    if (window.SN.user()) { window.location.href = 'index.html'; return; }

    const form  = document.getElementById('login-form');
    const pwdIn = document.getElementById('login-pwd');
    const eye   = document.getElementById('login-eye');

    eye?.addEventListener('click', () => {
      pwdIn.type = pwdIn.type === 'password' ? 'text' : 'password';
      eye.textContent = pwdIn.type === 'password' ? '👁' : '🙈';
    });

    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pwd   = pwdIn.value;
      const btn   = document.getElementById('login-btn');
      const err   = document.getElementById('login-err');

      if (!email || !pwd) { err.textContent = '⚠ Email and password required'; err.classList.add('d-block'); return; }

      err.classList.remove('d-block');
      btn.disabled = true;
      btn.textContent = '⏳ Signing in...';

      try {
        const data = await window.SN.fetch('/auth/login', {
          method: 'POST', body: JSON.stringify({ email, password: pwd })
        });
        window.SN.setSession(data.token, data.user);
        window.SN.toast('Welcome back, ' + data.user.name.split(' ')[0] + '! 👋', 's');
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        setTimeout(() => window.location.href = redirect, 1000);
      } catch (ex) {
        err.textContent = '⚠ ' + ex.message;
        err.classList.add('d-block');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
  }
});