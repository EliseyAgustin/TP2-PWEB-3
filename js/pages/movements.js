(function () {
  if (!auth.requireAuth()) return;

  renderSidebar('movements');

  // ===== CARGAR SELECT DE PRODUCTOS =====
  async function loadProductSelect() {
    try {
      const data   = await api.getProducts();
      const select = document.getElementById('m-product');
      select.innerHTML = '<option value="">Seleccionar producto...</option>';
      data.products.forEach(p => {
        const isLow = p.quantity <= p.min_stock;
        const label = isLow
          ? `${p.name} (stock: ${p.quantity} ⚠)`
          : `${p.name} (stock: ${p.quantity})`;
        select.appendChild(createEl('option', { value: String(p.id) }, label));
      });
    } catch {
      showAlert('form-alert', 'Error al cargar productos');
    }
  }

  // ===== SUBMIT =====
  document.getElementById('movement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('form-alert');

    const product_id  = document.getElementById('m-product').value;
    const type        = document.getElementById('m-type').value;
    const quantity    = parseInt(document.getElementById('m-quantity').value);
    const description = document.getElementById('m-description').value.trim() || null;

    if (!product_id)                   { showAlert('form-alert', 'Seleccioná un producto'); return; }
    if (!type)                         { showAlert('form-alert', 'Seleccioná el tipo de movimiento'); return; }
    if (isNaN(quantity) || quantity < 1) { showAlert('form-alert', 'La cantidad debe ser mayor a 0'); return; }

    const submitBtn = document.getElementById('movement-submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    try {
      await api.createMovement({ product_id: parseInt(product_id), type, quantity, description });
      document.getElementById('movement-form').reset();
      await Promise.all([loadProductSelect(), loadMovements()]);
      showToast('Movimiento registrado correctamente', 'success');
    } catch (err) {
      showAlert('form-alert', err.message || 'Error al registrar el movimiento');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
    }
  });

  // ===== RENDER HISTORIAL =====
  function renderMovements(movements) {
    const tbody = document.getElementById('movements-tbody');
    tbody.innerHTML = '';

    if (movements.length === 0) {
      tbody.appendChild(emptyStateRow(6, 'Sin movimientos registrados', 'fa-right-left', 'Registrá el primer movimiento con el formulario de arriba'));
      return;
    }

    movements.forEach(m => {
      const tr = document.createElement('tr');

      const tdType = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `badge badge-${m.type}`;
      badge.innerHTML = m.type === 'entrada'
        ? '<i class="fa-solid fa-arrow-down" aria-hidden="true"></i> Entrada'
        : '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i> Salida';
      tdType.appendChild(badge);

      tr.appendChild(createEl('td', {}, m.product_name));
      tr.appendChild(tdType);
      tr.appendChild(createEl('td', {}, String(m.quantity)));
      tr.appendChild(createEl('td', {}, m.description || '—'));
      tr.appendChild(createEl('td', {}, m.username));
      tr.appendChild(createEl('td', {}, formatDate(m.created_at)));
      tbody.appendChild(tr);
    });
  }

  async function loadMovements() {
    try {
      const data = await api.getMovements();
      renderMovements(data.movements);
    } catch {
      showAlert('form-alert', 'Error al cargar el historial');
    }
  }

  Promise.all([loadProductSelect(), loadMovements()]);
})();
