(function () {
  if (!auth.requireAuth()) return;

  renderSidebar('products');

  const isAdmin = auth.isAdmin();
  let editingId = null;

  if (isAdmin) {
    document.getElementById('btn-create').classList.remove('hidden');
    document.getElementById('actions-header').classList.remove('hidden');
  }

  // ===== MODAL =====
  function openModal(title, product) {
    editingId = product ? product.id : null;
    document.getElementById('modal-title').textContent     = title;
    document.getElementById('modal-subtitle').textContent  = product ? 'Modificá los datos del producto' : 'Completá los datos del producto';
    document.getElementById('modal-header-icon').className = product ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-plus';
    document.getElementById('product-id').value            = product ? product.id : '';
    document.getElementById('p-name').value                = product ? product.name : '';
    document.getElementById('p-description').value         = product ? (product.description || '') : '';
    document.getElementById('p-price').value               = product ? product.price : '';
    document.getElementById('p-quantity').value            = product ? product.quantity : '';
    document.getElementById('p-min-stock').value           = product ? product.min_stock : '10';
    document.getElementById('p-category').value            = product ? (product.category_id || '') : '';
    hideAlert('modal-alert');
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('p-name').focus();
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    editingId = null;
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('btn-create').addEventListener('click', () => openModal('Nuevo producto', null));
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // ===== SUBMIT =====
  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('modal-alert');

    const name        = document.getElementById('p-name').value.trim();
    const price       = parseFloat(document.getElementById('p-price').value);
    const quantity    = parseInt(document.getElementById('p-quantity').value);
    const min_stock   = parseInt(document.getElementById('p-min-stock').value) || 10;
    const description = document.getElementById('p-description').value.trim() || null;
    const catVal      = document.getElementById('p-category').value;
    const category_id = catVal ? parseInt(catVal) : null;

    if (!name)                           { showAlert('modal-alert', 'El nombre es requerido'); return; }
    if (isNaN(price)  || price < 0)      { showAlert('modal-alert', 'El precio debe ser un número positivo'); return; }
    if (isNaN(quantity) || quantity < 0) { showAlert('modal-alert', 'La cantidad debe ser >= 0'); return; }

    const submitBtn = document.getElementById('modal-submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    const wasEditing = !!editingId;
    try {
      if (editingId) {
        await api.updateProduct(editingId, { name, description, category_id, price, quantity, min_stock });
      } else {
        await api.createProduct({ name, description, category_id, price, quantity, min_stock });
      }
      closeModal();
      await loadProducts();
      showToast(wasEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente', 'success');
    } catch (err) {
      showAlert('modal-alert', err.message || 'Error al guardar el producto');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

  // ===== DELETE =====
  async function deleteProduct(id, name) {
    if (!confirm(`¿Eliminar el producto "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      await loadProducts();
      showToast('Producto eliminado correctamente', 'success');
    } catch (err) {
      showAlert('page-alert', err.message || 'Error al eliminar el producto');
    }
  }

  // ===== RENDER =====
  function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '';

    if (products.length === 0) {
      tbody.appendChild(emptyStateRow(7, 'No hay productos registrados', 'fa-boxes-stacked', 'Creá el primer producto con el botón de arriba'));
      return;
    }

    products.forEach(p => {
      const tr    = document.createElement('tr');
      const isLow = p.quantity <= p.min_stock;

      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = isLow ? 'badge badge-warning' : 'badge badge-entrada';
      badge.innerHTML = isLow
        ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Bajo'
        : '<i class="fa-solid fa-check" aria-hidden="true"></i> OK';
      tdStatus.appendChild(badge);

      tr.appendChild(createEl('td', {}, p.name));
      tr.appendChild(createEl('td', {}, p.category_name || '—'));
      tr.appendChild(createEl('td', {}, `$${parseFloat(p.price).toFixed(2)}`));
      tr.appendChild(createEl('td', {}, String(p.quantity)));
      tr.appendChild(createEl('td', {}, String(p.min_stock)));
      tr.appendChild(tdStatus);

      if (isAdmin) {
        const tdAct = document.createElement('td');
        tdAct.className = 'td-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-edit btn-sm';
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Editar';
        editBtn.setAttribute('aria-label', `Editar ${p.name}`);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash" aria-hidden="true"></i> Eliminar';
        deleteBtn.setAttribute('aria-label', `Eliminar ${p.name}`);

        editBtn.addEventListener('click',   () => openModal('Editar producto', p));
        deleteBtn.addEventListener('click', () => deleteProduct(p.id, p.name));

        tdAct.appendChild(editBtn);
        tdAct.appendChild(deleteBtn);
        tr.appendChild(tdAct);
      }

      tbody.appendChild(tr);
    });
  }

  // ===== LOAD =====
  async function loadProducts() {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);

      const select = document.getElementById('p-category');
      select.innerHTML = '<option value="">Sin categoría</option>';
      categoriesData.categories.forEach(c => {
        select.appendChild(createEl('option', { value: String(c.id) }, c.name));
      });

      renderProducts(productsData.products);
    } catch {
      showAlert('page-alert', 'Error al cargar los productos');
    }
  }

  loadProducts();
})();
