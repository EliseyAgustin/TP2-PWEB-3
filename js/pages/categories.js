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

    if (!name)            { showAlert('page-alert', 'El nombre de la categoría es requerido'); return; }
    if (name.length > 50) { showAlert('page-alert', 'El nombre no puede superar los 50 caracteres'); return; }

    const submitBtn = document.querySelector('#category-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      await api.createCategory({ name, description });
      document.getElementById('c-name').value        = '';
      document.getElementById('c-description').value = '';
      await loadCategories();
      showToast('Categoría creada correctamente', 'success');
    } catch (err) {
      showAlert('page-alert', err.message || 'Error al crear la categoría');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

  // ===== ELIMINAR =====
  async function deleteCategory(id, name) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      await loadCategories();
      showToast('Categoría eliminada correctamente', 'success');
    } catch (err) {
      showAlert('page-alert', err.message || 'Error al eliminar la categoría');
    }
  }

  // ===== RENDER =====
  function renderCategories(categories) {
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = '';

    if (categories.length === 0) {
      tbody.appendChild(emptyStateRow(4, 'No hay categorías registradas', 'fa-tags', 'Creá la primera categoría con el formulario de arriba'));
      return;
    }

    categories.forEach(c => {
      const tr = document.createElement('tr');

      tr.appendChild(createEl('td', {}, c.name));
      tr.appendChild(createEl('td', {}, c.description || '—'));
      tr.appendChild(createEl('td', {}, formatDate(c.created_at)));

      if (isAdmin) {
        const tdAct = document.createElement('td');
        tdAct.className = 'td-actions';

        const delBtn = document.createElement('button');
        delBtn.className = 'btn btn-danger btn-sm';
        delBtn.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i> Eliminar';
        delBtn.setAttribute('aria-label', `Eliminar categoría ${c.name}`);
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
