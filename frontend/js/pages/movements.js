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
        select.appendChild(
          createEl('option', { value: String(p.id) }, `${p.name} (stock: ${p.quantity})`)
        );
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

    if (!product_id)              { showAlert('form-alert', 'Seleccioná un producto'); return; }
    if (!type)                    { showAlert('form-alert', 'Seleccioná el tipo de movimiento'); return; }
    if (isNaN(quantity) || quantity < 1) { showAlert('form-alert', 'La cantidad debe ser mayor a 0'); return; }

    const submitBtn    = document.getElementById('movement-submit');
    submitBtn.disabled = true;

    try {
      await api.createMovement({ product_id: parseInt(product_id), type, quantity, description });
      document.getElementById('movement-form').reset();
      await Promise.all([loadProductSelect(), loadMovements()]);
      showAlert('form-alert', 'Movimiento registrado correctamente', 'success');
      setTimeout(() => hideAlert('form-alert'), 3000);
    } catch (err) {
      showAlert('form-alert', err.message || 'Error al registrar el movimiento');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ===== RENDER HISTORIAL =====
  function renderMovements(movements) {
    const tbody = document.getElementById('movements-tbody');
    tbody.innerHTML = '';

    if (movements.length === 0) {
      const tr = document.createElement('tr');
      tr.appendChild(createEl('td', { colspan: '6', className: 'empty-state' }, 'Sin movimientos registrados'));
      tbody.appendChild(tr);
      return;
    }

    movements.forEach(m => {
      const tr     = document.createElement('tr');
      const tdType = document.createElement('td');
      tdType.appendChild(createEl('span', { className: `badge badge-${m.type}` }, m.type));

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
