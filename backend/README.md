# Stock Almacén — Backend API

API REST de gestión de stock para almacén, desarrollada con Node.js y Express.

## Tecnologías

- Node.js + Express
- JWT (jsonwebtoken) + bcryptjs
- Helmet, CORS, express-rate-limit
- Winston (logs)
- Base de datos: archivo JSON (`data/db.json`)

## Requisitos

- Node.js >= 16

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <url-repositorio-backend>
   cd stock-almacen-backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Crear el archivo `.env` en la raíz del proyecto:
   ```env
   JWT_SECRET=una_clave_secreta_larga_y_segura
   JWT_EXPIRES_IN=1h
   PORT=3000
   FRONTEND_URL=http://localhost:5500
   ```

4. Iniciar el servidor:
   ```bash
   npm run dev    # desarrollo con recarga automática
   npm start      # producción
   ```

El servidor queda disponible en `http://localhost:3000`.

## Usuarios de prueba (generados automáticamente)

| Usuario    | Contraseña | Rol   |
|------------|------------|-------|
| admin      | admin123   | admin |
| encargado  | user123    | user  |

## Endpoints

| Método | Ruta                        | Auth | Rol   |
|--------|-----------------------------|------|-------|
| POST   | /api/auth/login             | No   | —     |
| GET    | /api/auth/me                | Sí   | any   |
| GET    | /api/products               | Sí   | any   |
| GET    | /api/products/low-stock     | Sí   | any   |
| POST   | /api/products               | Sí   | admin |
| PUT    | /api/products/:id           | Sí   | admin |
| DELETE | /api/products/:id           | Sí   | admin |
| GET    | /api/categories             | Sí   | any   |
| POST   | /api/categories             | Sí   | admin |
| DELETE | /api/categories/:id         | Sí   | admin |
| GET    | /api/movements              | Sí   | any   |
| POST   | /api/movements              | Sí   | any   |

## Seguridad

- **Helmet**: cabeceras HTTP seguras
- **JWT**: autenticación stateless con expiración configurable
- **bcryptjs**: contraseñas hasheadas con salt de 10 rondas
- **Rate limiting**: 100 req/15min general, 5 req/15min en `/api/auth/login`
- **Sanitización**: los inputs de body y query params son sanitizados contra XSS
- **CORS**: restringido al origen del frontend (`FRONTEND_URL` en .env)
- **Logs**: Winston registra requests, eventos de auth y errores en `logs/`
