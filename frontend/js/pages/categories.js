(function () {
  if (!auth.requireAuth()) return;

  renderSidebar('categories');

  const isAdmin = auth.isAdmin();

  if (isAdmin) {
    document.getElementById('create-form-section').classList.remove('hidden');
    document.getElementById('actions-header').classList.remove('hidden');
  }

  // ===== CREAR =====
  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('page-alert');

    const name        = document.getElementById('c-name').value.trim();
    const description = document.getElementById('c-description').value.trim() || null;

    if (!name)          { showAlert('page-alert', 'El nombre de la categoría es requerido'); return; }
    if (name.length > 50) { showAlert('page-alert', 'El nombre no puede superar los 50 caracteres'); return; }

    try {
      await api.createCategory({ name, description });
      document.getElementById('c-name').value        = '';
      document.getElementById('c-description').value = '';
      await loadCategories();
      showAlert('page-alert', 'Categoría creada correctamente', 'success');
      setTimeout(() => hideAlert('page-alert'), 3000);
    } catch (err) {
      showAlert('page-alert', err.message || 'Error al crear la categoría');
    }
  });

  // ===== ELIMINAR =====
  async function deleteCategory(id, name) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      await loadCategories();
      showAlert('page-alert', 'Categoría eliminada correctamente', 'success');
      setTimeout(() => hideAlert('page-alert'), 3000);
    } catch (err) {
      showAlert('page-alert', err.message || 'Error al eliminar la categoría');
    }
  }

  // ===== RENDER =====
  function renderCategories(categories) {
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = '';

    if (categories.length === 0) {
      const tr = document.createElement('tr');
      tr.appendChild(createEl('td', { colspan: '4', className: 'empty-state' }, 'No hay categorías registradas'));
      tbody.appendChild(tr);
      return;
    }

    categories.forEach(c => {
      const tr = document.createElement('tr');

      tr.appendChild(createEl('td', {}, c.name));
      tr.appendChild(createEl('td', {}, c.description || '—'));
      tr.appendChild(createEl('td', {}, formatDate(c.created_at)));

      if (isAdmin) {
        const tdAct    = document.createElement('td');
        const delBtn   = createEl('button', { className: 'btn btn-danger btn-sm' }, 'Eliminar');
        delBtn.addEventListener('click', () => deleteCategory(c.id, c.name));
        tdAct.appendChild(delBtn);
        tr.appendChild(tdAct);
      }

      tbody.appendChild(tr);
    });
  }

  // ===== LOAD =====
  async function loadCategories() {
    try {
      const data = await api.getCategories();
      renderCategories(data.categories);
    } catch {
      showAlert('page-alert', 'Error al cargar las categorías');
    }
  }

  loadCategories();
})();
