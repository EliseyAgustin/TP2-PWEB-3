function renderSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = auth.getUser();
  if (!user) return;

  const navItems = [
    { href: 'dashboard.html',  label: 'Dashboard',   id: 'dashboard'  },
    { href: 'products.html',   label: 'Productos',   id: 'products'   },
    { href: 'categories.html', label: 'Categorías',  id: 'categories' },
    { href: 'movements.html',  label: 'Movimientos', id: 'movements'  }
  ];

  const logo = createEl('div', { className: 'sidebar-logo' }, 'StockApp');
  sidebar.appendChild(logo);

  const ul = createEl('ul', { className: 'sidebar-nav' });
  navItems.forEach(item => {
    const li = document.createElement('li');
    const a = createEl('a', { href: item.href }, item.label);
    if (item.id === activePage) a.classList.add('active');
    li.appendChild(a);
    ul.appendChild(li);
  });
  sidebar.appendChild(ul);

  const userDiv = createEl('div', { className: 'sidebar-user' });
  const nameSpan = createEl('span', { className: 'sidebar-username' }, user.username);
  const roleSpan = createEl('span', { className: `badge badge-${user.role}` }, user.role);
  const logoutBtn = createEl('button', { className: 'btn btn-logout' }, 'Cerrar sesión');
  logoutBtn.addEventListener('click', () => auth.logout());

  userDiv.appendChild(nameSpan);
  userDiv.appendChild(roleSpan);
  userDiv.appendChild(logoutBtn);
  sidebar.appendChild(userDiv);
}
