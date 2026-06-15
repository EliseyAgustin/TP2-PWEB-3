(function () {
  if (!auth.requireAuth()) return;

  renderSidebar('dashboard');

  // Greeting with username
  const user = auth.getUser();
  const h1 = document.querySelector('.page-header h1');
  if (h1 && user) {
    h1.outerHTML = `
      <div class="page-header-meta">
        <h1>Dashboard</h1>
        <p class="page-greeting">
          <i class="fa-solid fa-circle-user" aria-hidden="true"></i>
          Bienvenido, <strong>${sanitize(user.username)}</strong>
        </p>
      </div>`;
  }

  function renderRecentMovements(movements) {
    const tbody = document.getElementById('recent-movements');
    tbody.innerHTML = '';

    if (movements.length === 0) {
      tbody.appendChild(emptyStateRow(5, 'Sin movimientos registrados', 'fa-clock-rotate-left', 'Los movimientos aparecerán aquí'));
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
          `Hay ${lowStockData.total} producto(s) con stock por debajo del mínimo`, 'warning');
      }

      renderRecentMovements(movementsData.movements.slice(0, 5));
    } catch {
      showAlert('low-stock-alert', 'Error al cargar los datos del dashboard', 'error');
    }
  }

  loadDashboard();
})();
