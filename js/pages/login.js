(function () {
  if (auth.getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const btn  = document.getElementById('login-btn');

  function validateField(errorId, condition, message) {
    const el = document.getElementById(errorId);
    if (!condition) {
      el.textContent = message;
      el.style.display = 'block';
      return false;
    }
    el.style.display = 'none';
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('login-alert');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const usernameOk = validateField('username-error', username.length >= 3,
      'El usuario debe tener al menos 3 caracteres');
    const passwordOk = validateField('password-error', password.length >= 6,
      'La contraseña debe tener al menos 6 caracteres');

    if (!usernameOk || !passwordOk) return;

    btn.disabled    = true;
    btn.textContent = 'Ingresando...';

    try {
      const data = await api.login({ username, password });
      auth.login(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch {
      showAlert('login-alert', 'Usuario o contraseña incorrectos');
    } finally {
      btn.disabled    = false;
      btn.textContent = 'Iniciar sesión';
    }
  });
})();
