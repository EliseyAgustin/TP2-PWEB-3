# Stock Almacén — Frontend

Interfaz de usuario para el sistema de gestión de stock, desarrollada en HTML + CSS + JavaScript vanilla.

## Tecnologías

- HTML5, CSS3 (Custom Properties)
- JavaScript ES6+ (Fetch API, sessionStorage)
- Sin frameworks ni dependencias de build

## Requisitos

- El backend debe estar corriendo en `http://localhost:3000` (ver repositorio backend)
- Extensión **Live Server** para VS Code (u otro servidor HTTP estático)

> Los archivos deben servirse desde HTTP, no desde `file://`. Usar Live Server o similar.

## Instalación y ejecución

1. Clonar el repositorio:
   ```bash
   git clone <url-repositorio-frontend>
   cd stock-almacen-frontend
   ```

2. Asegurarse de que el backend esté corriendo (ver instrucciones del repo backend).

3. Abrir la carpeta en VS Code → click derecho en `login.html` → **Open with Live Server**.
   - Por defecto abre en `http://localhost:5500`

4. Iniciar sesión:
   - **admin** / admin123 → acceso completo (CRUD de productos y categorías)
   - **encargado** / user123 → solo lectura + puede registrar movimientos de stock

## Estructura

```
├── login.html           # Pantalla de inicio de sesión
├── dashboard.html       # Resumen: stats, alertas, últimos movimientos
├── products.html        # Gestión de productos (CRUD para admin)
├── categories.html      # Gestión de categorías (CRUD para admin)
├── movements.html       # Registrar y ver historial de movimientos
├── css/
│   └── style.css        # Tema oscuro, layout, todos los componentes
└── js/
    ├── api.js           # Fetch wrapper — único punto de contacto con el backend
    ├── auth.js          # Login, logout, guard de autenticación
    ├── utils.js         # sanitize(), formatDate(), helpers DOM seguros
    ├── layout.js        # Sidebar compartido renderizado dinámicamente
    └── pages/
        ├── login.js
        ├── dashboard.js
        ├── products.js
        ├── categories.js
        └── movements.js
```

## Seguridad

### Almacenamiento del token JWT: sessionStorage

Se eligió **sessionStorage** porque:

- El token se elimina automáticamente al cerrar la pestaña o el navegador, reduciendo la ventana de exposición ante ataques XSS persistentes
- Adecuado para sesiones de trabajo definidas (turno del encargado de almacén)
- `localStorage` fue descartado porque el token persistiría indefinidamente, ampliando innecesariamente el riesgo XSS
- Las **cookies** fueron descartadas para mantener la implementación simple y evitar protección CSRF, ya que la API es stateless y usa el header `Authorization: Bearer <token>`

### Otras medidas aplicadas

| Medida | Implementación |
|--------|----------------|
| Prevención XSS | Todos los datos dinámicos se insertan con `textContent`, nunca con `innerHTML` |
| Sanitización | `utils.sanitize()` escapa `<>&"'` antes de cualquier inserción en el DOM |
| Sin hardcodeo | Solo `API_BASE` como constante configurable; sin tokens ni claves en el código |
| Sin datos en consola | Cero `console.log` con información sensible |
| Manejo de errores | Mensajes genéricos al usuario; sin stack traces ni detalles internos del servidor |
| Validación cliente | Campos requeridos, longitudes y tipos validados antes de cada submit |
| Token expirado | Respuesta 401 con token activo → sessionStorage limpiado, redirige a login |