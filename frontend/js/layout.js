// layout.js - Renders the unified navigation sidebar, user profile, theme manager, and dialogs for WealthPulse

// Initialize theme immediately on load
(function initTheme() {
  const savedTheme = localStorage.getItem('wealthpulse_theme') || 'slate';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wealthpulse_theme', theme);
  
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

function renderSidebar(active) {
  const el = document.getElementById('app-sidebar');
  if (!el) return;
  const user = Auth.user || { name: 'Member', email: 'user@wealthpulse.io', role: 'user', currency: 'INR' };
  const isAdmin = user.role === 'admin';
  const currentTheme = localStorage.getItem('wealthpulse_theme') || 'slate';

  const nameParts = (user.name || '').trim().split(/\s+/).filter(Boolean);
  const initials = nameParts.length > 0
    ? nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'W';

  const safeName = typeof escapeHtml === 'function' ? escapeHtml(user.name || 'Member') : (user.name || 'Member');
  const safeEmail = typeof escapeHtml === 'function' ? escapeHtml(user.email || '') : (user.email || '');
  const currency = user.currency || 'INR';

  const links = [
    { href: '/dashboard.html', label: 'Dashboard', icon: '📊', key: 'dashboard' },
    { href: '/expenses.html', label: 'Income & Expenses', icon: '💳', key: 'expenses' },
    { href: '/habits.html', label: 'Habit Builder', icon: '⚡', key: 'habits' },
    { href: '/goals.html', label: 'Savings Goals', icon: '🎯', key: 'goals' },
    { href: '/investments.html', label: 'Investments & Assets', icon: '📈', key: 'investments' },
    { href: '/analytics.html', label: 'Wealth Analytics', icon: '📉', key: 'analytics' },
    { href: '/settings.html', label: 'Settings', icon: '⚙️', key: 'settings' },
  ];
  if (isAdmin) {
    links.push({ href: '/admin.html', label: 'Admin Command', icon: '🛡️', key: 'admin' });
  }

  el.innerHTML = `
    <div class="brand-row">
      <div class="brand-mark">W</div>
      <div>
        <div class="brand-title">WealthPulse</div>
        <div class="brand-subtitle">Habit & Wealth Intelligence</div>
      </div>
    </div>
    <nav>
      ${links.map(l => `
        <a class="nav-link ${l.key === active ? 'active' : ''}" href="${l.href}" data-testid="nav-${l.key}">
          <span style="font-size: 15px;">${l.icon}</span>
          <span>${l.label}</span>
        </a>
      `).join('')}
    </nav>
    
    <div class="user-block">
      <div class="user-card-inner">
        <div class="user-avatar-badge">${initials}</div>
        <div class="user-info-text">
          <strong>${safeName}</strong>
          <span class="user-email">${safeEmail}</span>
        </div>
      </div>
      <div class="flex between" style="align-items: center; margin-bottom: 8px;">
        <span class="badge ${isAdmin ? 'amber' : 'blue'}">${(user.role || 'USER').toUpperCase()}</span>
        <button class="badge" onclick="openProfileModal()" style="cursor: pointer; background: var(--bg-3); border: 1px solid var(--border-strong);" title="Change currency or profile">
          ⚙️ ${currency}
        </button>
      </div>

      <div class="theme-switch-row">
        <button class="theme-btn ${currentTheme === 'slate' ? 'active' : ''}" data-theme="slate" onclick="setTheme('slate')">🌙 Dark</button>
        <button class="theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-theme="light" onclick="setTheme('light')">☀️ Light</button>
        <button class="theme-btn ${currentTheme === 'indigo' ? 'active' : ''}" data-theme="indigo" onclick="setTheme('indigo')">💎 Indigo</button>
      </div>

      <div class="flex gap-8 mt-8">
        <button class="btn btn-ghost btn-sm" style="flex: 1;" onclick="openFeedbackModal()" title="Send Feedback">💬 Feedback</button>
        <button class="btn btn-ghost btn-sm" data-testid="logout-btn" onclick="Auth.logout()" title="Sign Out">Log out</button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// Global Profile & Currency Modal
// ----------------------------------------------------
function openProfileModal() {
  const existing = document.getElementById('profile-modal');
  if (existing) existing.remove();

  const user = Auth.user || { name: '', email: '', currency: 'INR' };
  const currentCurrency = user.currency || 'INR';

  const modal = document.createElement('div');
  modal.id = 'profile-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Account & Currency Preferences</h2>
        <button class="modal-close" onclick="closeProfileModal()">✕</button>
      </div>
      <div id="profile-alert"></div>
      <form id="profile-form">
        <div class="form-group">
          <label for="p-name">Full Name</label>
          <input id="p-name" value="${escapeHtml(user.name || '')}" required />
        </div>
        <div class="form-group">
          <label for="p-currency">Primary Currency</label>
          <select id="p-currency">
            <option value="INR" ${currentCurrency === 'INR' ? 'selected' : ''}>INR (₹) - Indian Rupee</option>
            <option value="USD" ${currentCurrency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
            <option value="EUR" ${currentCurrency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
            <option value="GBP" ${currentCurrency === 'GBP' ? 'selected' : ''}>GBP (£) - British Pound</option>
            <option value="AED" ${currentCurrency === 'AED' ? 'selected' : ''}>AED (د.إ) - UAE Dirham</option>
            <option value="SGD" ${currentCurrency === 'SGD' ? 'selected' : ''}>SGD (S$) - Singapore Dollar</option>
            <option value="CAD" ${currentCurrency === 'CAD' ? 'selected' : ''}>CAD (C$) - Canadian Dollar</option>
            <option value="AUD" ${currentCurrency === 'AUD' ? 'selected' : ''}>AUD (A$) - Australian Dollar</option>
          </select>
        </div>
        <div class="form-group">
          <label for="p-password">New Password (Leave blank to keep current)</label>
          <input id="p-password" type="password" minlength="6" placeholder="••••••••" />
        </div>
        <div class="flex gap-8 mt-16" style="justify-content: flex-end;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="closeProfileModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('profile-alert');
    alertBox.innerHTML = '';
    const name = document.getElementById('p-name').value.trim();
    const currency = document.getElementById('p-currency').value;
    const password = document.getElementById('p-password').value;

    const payload = { name, currency };
    if (password && password.trim().length >= 6) {
      payload.password = password.trim();
    }

    try {
      const data = await api('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (data && data.user) {
        Auth.updateUser(data.user);
      }
      closeProfileModal();
      window.location.reload();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  });
}

function closeProfileModal() {
  const m = document.getElementById('profile-modal');
  if (m) m.remove();
}

// ----------------------------------------------------
// Global User Feedback Modal
// ----------------------------------------------------
function openFeedbackModal() {
  const existing = document.getElementById('feedback-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'feedback-modal';
  modal.className = 'modal-backdrop';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Send Feedback or Inquiries</h2>
        <button class="modal-close" onclick="closeFeedbackModal()">✕</button>
      </div>
      <p class="text-muted" style="font-size: 13px; margin-top: -12px; margin-bottom: 16px;">
        Share suggestions, report bugs, or request new features directly to platform admins.
      </p>
      <div id="user-fb-alert"></div>
      <form id="user-fb-form">
        <div class="form-group">
          <label for="fb-message">Your Message / Feedback</label>
          <textarea id="fb-message" rows="4" required placeholder="Describe your suggestions or issue here..." style="resize: vertical;"></textarea>
        </div>
        <div class="flex gap-8 mt-16" style="justify-content: flex-end;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="closeFeedbackModal()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Submit Feedback</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('user-fb-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('user-fb-alert');
    alertBox.innerHTML = '';
    const message = document.getElementById('fb-message').value.trim();
    if (!message) return;

    try {
      await api('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      alertBox.innerHTML = `<div class="alert alert-success">Thank you! Your feedback was sent successfully.</div>`;
      setTimeout(() => closeFeedbackModal(), 1200);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
    }
  });
}

function closeFeedbackModal() {
  const m = document.getElementById('feedback-modal');
  if (m) m.remove();
}

