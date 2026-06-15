const NAV_ICONS = {
  dashboard:  '<i class="fa-solid fa-gauge" aria-hidden="true"></i>',
  products:   '<i class="fa-solid fa-boxes-stacked" aria-hidden="true"></i>',
  categories: '<i class="fa-solid fa-tags" aria-hidden="true"></i>',
  movements:  '<i class="fa-solid fa-right-left" aria-hidden="true"></i>',
};

function renderSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const user = auth.getUser();
  if (!user) return;

  const navItems = [
    { href: 'dashboard.html',  label: 'Dashboard',   id: 'dashboard'  },
    { href: 'products.html',   label: 'Productos',   id: 'products'   },
    { href: 'categories.html', label: 'Categorías',  id: 'categories' },
    { href: 'movements.html',  label: 'Movimientos', id: 'movements'  },
  ];

  /* Logo */
  const logoEl = document.createElement('a');
  logoEl.href = 'dashboard.html';
  logoEl.className = 'sidebar-logo';
  logoEl.innerHTML = '<i class="fa-solid fa-warehouse" aria-hidden="true"></i> StockApp';
  sidebar.appendChild(logoEl);

  /* Nav */
  const ul = document.createElement('ul');
  ul.className = 'sidebar-nav';
  ul.setAttribute('role', 'navigation');

  navItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.innerHTML = (NAV_ICONS[item.id] || '') + `<span>${sanitize(item.label)}</span>`;
    if (item.id === activePage) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    li.appendChild(a);
    ul.appendChild(li);
  });
  sidebar.appendChild(ul);

  /* User section */
  const userDiv = document.createElement('div');
  userDiv.className = 'sidebar-user';

  const initials  = user.username.slice(0, 2).toUpperCase();
  const roleLabel = user.role === 'admin' ? 'Administrador' : 'Encargado';
  const roleClass = user.role === 'admin' ? 'badge-admin' : 'badge-user';

  const roleHeading = document.createElement('span');
  roleHeading.className = 'sidebar-role-label';
  roleHeading.textContent = 'Mi cuenta';

  const userCard = document.createElement('div');
  userCard.className = 'sidebar-user-card';
  userCard.innerHTML = `
    <div class="sidebar-avatar" aria-hidden="true">${sanitize(initials)}</div>
    <div class="sidebar-user-meta">
      <span class="sidebar-username">${sanitize(user.username)}</span>
      <span class="badge ${sanitize(roleClass)}">${sanitize(roleLabel)}</span>
    </div>
  `;

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-logout';
  logoutBtn.setAttribute('aria-label', 'Cerrar sesión');
  logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Cerrar sesión';
  logoutBtn.addEventListener('click', () => auth.logout());

  userDiv.appendChild(roleHeading);
  userDiv.appendChild(userCard);
  userDiv.appendChild(logoutBtn);
  sidebar.appendChild(userDiv);

  /* Mobile toggle */
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle';
  toggleBtn.setAttribute('aria-label', 'Abrir menú');
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', 'sidebar');
  toggleBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true" style="font-size:1.1rem"></i>';

  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Cerrar menú');
    toggleBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true" style="font-size:1.1rem"></i>';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Abrir menú');
    toggleBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true" style="font-size:1.1rem"></i>';
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) closeSidebar();
  });

  document.body.appendChild(toggleBtn);
  document.body.appendChild(backdrop);
}
