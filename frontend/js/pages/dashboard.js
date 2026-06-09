(function () {
  if (!auth.requireAuth()) return;

  renderSidebar('dashboard');

  function renderRecentMovements(movements) {
    const tbody = document.getElementById('recent-movements');
    tbody.innerHTML = '';

    if (movements.length === 0) {
      const tr = document.createElement('tr');
      tr.appendChild(createEl('td', { colspan: '5', className: 'empty-state' }, 'Sin movimientos registrados'));
      tbody.appendChild(tr);
      return;
    }

    movements.forEach(m => {
      const tr = document.createElement('tr');

      const tdType = document.createElement('td');
      tdType.appendChild(createEl('span', { className: `badge badge-${m.type}` }, m.type));

      tr.appendChild(createEl('td', {}, m.product_name));
      tr.appendChild(tdType);
      tr.appendChild(createEl('td', {}, String(m.quantity)));
      tr.appendChild(createEl('td', {}, m.username));
      tr.appendChild(createEl('td', {}, formatDate(m.created_at)));
      tbody.appendChild(tr);
    });
  }

  async function loadDashboard() {
    try {
      const [productsData, lowStockData, movementsData] = await Promise.all([
        api.getProducts(),
        api.getLowStock(),
        api.getMovements()
      ]);

      setText('total-products',  String(productsData.total));
      setText('low-stock-count', String(lowStockData.total));
      setText('total-movements', String(movementsData.total));

      if (lowStockData.total > 0) {
        showAlert('low-stock-alert',
          `⚠ Hay ${lowStockData.total} producto(s) con stock por debajo del mínimo`, 'warning');
      }

      renderRecentMovements(movementsData.movements.slice(0, 5));
    } catch {
      showAlert('low-stock-alert', 'Error al cargar los datos del dashboard');
    }
  }

  loadDashboard();
})();
