const auth = {
  login(token, user) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
  },

  getToken() {
    return sessionStorage.getItem('token');
  },

  getUser() {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  isAdmin() {
    const user = this.getUser();
    return user !== null && user.role === 'admin';
  },

  requireAuth() {
    if (!this.getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};
