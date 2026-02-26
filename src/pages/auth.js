// ═══════════════════════════════════════
// Auth Page — Login / Register
// ═══════════════════════════════════════

import { login, register } from '../engine/storage.js';
import { showToast } from '../components/toast.js';

export function renderAuthPage(container, navigate) {
  let mode = 'login'; // 'login' or 'register'
  let loading = false;

  function render() {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-container animate-in">
          <div class="auth-brand">
            <span class="hero-fate-sm">FATE</span>
            <span class="hero-condensed-sm">CONDENSED</span>
          </div>

          <!-- Tab Switcher -->
          <div class="auth-tabs">
            <button class="auth-tab ${mode === 'login' ? 'active' : ''}" data-mode="login">Giriş Yap</button>
            <button class="auth-tab ${mode === 'register' ? 'active' : ''}" data-mode="register">Kayıt Ol</button>
          </div>

          <!-- Form -->
          <form id="auth-form" class="auth-form">
            <div class="form-group">
              <label class="label">Kullanıcı Adı</label>
              <input class="input" id="auth-username" type="text" placeholder="Kullanıcı adınız" 
                     autocomplete="username" required minlength="3" />
            </div>
            <div class="form-group">
              <label class="label">Şifre</label>
              <input class="input" id="auth-password" type="password" placeholder="Şifreniz"
                     autocomplete="${mode === 'register' ? 'new-password' : 'current-password'}" 
                     required minlength="4" />
            </div>
            ${mode === 'register' ? `
              <div class="form-group">
                <label class="label">Şifre Tekrar</label>
                <input class="input" id="auth-password2" type="password" placeholder="Şifrenizi tekrar girin"
                       autocomplete="new-password" required minlength="4" />
              </div>
              <div class="form-group" style="margin-top: var(--sp-sm);">
                <label class="label">Rolünüz</label>
                <div style="display: flex; gap: var(--sp-sm);">
                  <label style="flex: 1; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                    <input type="radio" name="auth-role" value="player" checked>
                    <span>Oyuncu</span>
                  </label>
                  <label style="flex: 1; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px; background: rgba(255,255,255,0.05); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                    <input type="radio" name="auth-role" value="dm">
                    <span>Oyun Yöneticisi (DM)</span>
                  </label>
                </div>
              </div>
            ` : ''}
            <div id="auth-error" class="auth-error" style="display: none;"></div>
            <button class="btn btn-gold btn-lg auth-submit" type="submit" ${loading ? 'disabled' : ''}>
              ${loading ? '⏳ Bekleyin...' : mode === 'login' ? '🔑 Giriş Yap' : '✦ Kayıt Ol'}
            </button>
          </form>

          <p class="auth-switch">
            ${mode === 'login'
        ? 'Hesabınız yok mu? <a href="#" id="switch-mode">Kayıt olun</a>'
        : 'Zaten hesabınız var mı? <a href="#" id="switch-mode">Giriş yapın</a>'}
          </p>
        </div>
      </div>

      <style>
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: var(--sp-lg);
        }
        .auth-container {
          width: 100%;
          max-width: 420px;
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          border: 1px solid var(--border-card);
          border-radius: var(--radius-xl);
          padding: var(--sp-2xl);
          box-shadow: var(--shadow-glow);
        }
        .auth-brand {
          text-align: center;
          margin-bottom: var(--sp-xl);
        }
        .hero-fate-sm {
          display: block;
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 6px;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-condensed-sm {
          display: block;
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 300;
          letter-spacing: 8px;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .auth-tabs {
          display: flex;
          gap: 2px;
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-md);
          padding: 3px;
          margin-bottom: var(--sp-xl);
        }
        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .auth-tab.active {
          background: rgba(240, 165, 0, 0.1);
          color: var(--gold);
        }
        .auth-tab:hover:not(.active) {
          color: var(--text-secondary);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--sp-md);
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .auth-error {
          padding: var(--sp-sm) var(--sp-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-sm);
          color: var(--danger);
          font-size: 0.85rem;
        }
        .auth-submit {
          width: 100%;
          margin-top: var(--sp-sm);
        }
        .auth-switch {
          text-align: center;
          margin-top: var(--sp-lg);
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .auth-switch a {
          color: var(--gold);
          font-weight: 600;
        }
      </style>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Tab switching
    container.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode;
        render();
      });
    });

    // Switch link
    document.getElementById('switch-mode')?.addEventListener('click', (e) => {
      e.preventDefault();
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });

    // Form submit
    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('auth-error');
      errorEl.style.display = 'none';

      const username = document.getElementById('auth-username').value.trim();
      const password = document.getElementById('auth-password').value;
      let role = 'player';

      if (mode === 'register') {
        const password2 = document.getElementById('auth-password2').value;
        role = document.querySelector('input[name="auth-role"]:checked')?.value || 'player';
        if (password !== password2) {
          errorEl.textContent = 'Şifreler eşleşmiyor!';
          errorEl.style.display = 'block';
          return;
        }
      }

      loading = true;
      const submitBtn = container.querySelector('.auth-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Bekleyin...';
      }

      try {
        if (mode === 'login') {
          await login(username, password);
          showToast('Giriş başarılı!', 'success');
        } else {
          await register(username, password, role);
          showToast('Hesap oluşturuldu!', 'success');
        }
        navigate('home');
      } catch (err) {
        errorEl.textContent = err.message || 'Bir hata oluştu';
        errorEl.style.display = 'block';
        loading = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = mode === 'login' ? '🔑 Giriş Yap' : '✦ Kayıt Ol';
        }
      }
    });
  }

  render();
}
