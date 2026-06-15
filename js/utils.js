function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showAlert(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = message;
  el.style.display = 'block';
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function emptyStateRow(colspan, message, icon = 'fa-inbox', hint = '') {
  const tr = document.createElement('tr');
  const td = document.createElement('td');
  td.setAttribute('colspan', String(colspan));
  td.className = 'empty-state-td';
  td.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid ${icon} empty-state-icon" aria-hidden="true"></i>
      <div class="empty-state-title">${sanitize(message)}</div>
      ${hint ? `<div class="empty-state-desc">${sanitize(hint)}</div>` : ''}
    </div>`;
  tr.appendChild(td);
  return tr;
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span class="toast-dot"></span><span>${sanitize(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

function createEl(tag, attrs, text) {
  attrs = attrs || {};
  const el = document.createElement(tag);
  for (const k of Object.keys(attrs)) {
    if (k === 'className') el.className = attrs[k];
    else el.setAttribute(k, attrs[k]);
  }
  if (text !== undefined) el.textContent = text;
  return el;
}
