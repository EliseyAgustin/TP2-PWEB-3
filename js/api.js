const API_BASE = 'http://localhost:3000/api';

async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (response.status === 401 && token) {
    sessionStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
}

const api = {
  login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  getProducts:   ()        => apiFetch('/products'),
  getLowStock:   ()        => apiFetch('/products/low-stock'),
  createProduct: (body)    => apiFetch('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body)=> apiFetch(`/products/${id}`, { method: 'PUT',  body: JSON.stringify(body) }),
  deleteProduct: (id)      => apiFetch(`/products/${id}`, { method: 'DELETE' }),

  getCategories:  ()     => apiFetch('/categories'),
  createCategory: (body) => apiFetch('/categories', { method: 'POST', body: JSON.stringify(body) }),
  deleteCategory: (id)   => apiFetch(`/categories/${id}`, { method: 'DELETE' }),

  getMovements:   ()     => apiFetch('/movements'),
  createMovement: (body) => apiFetch('/movements', { method: 'POST', body: JSON.stringify(body) })
};
