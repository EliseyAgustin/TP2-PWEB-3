# Sistema de Stock — TP PWEB3

Proyecto full stack de gestión de stock para almacén.

## Estructura

```
backend/   → API REST con Node.js + Express + JWT
frontend/  → Interfaz web en HTML + CSS + JS vanilla
```

## Instrucciones

### Backend (API REST)

1. Ir a la carpeta `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Crear un archivo `.env` en `backend/` con:
   ```
   PORT=3000
   JWT_SECRET=tu_clave_secreta
   ```
3. Iniciar el servidor:
   ```bash
   npm start
   ```
   La API queda disponible en `http://localhost:3000`.

### Frontend

- Ver [`frontend/README.md`](./frontend/README.md) para ejecutar la interfaz.
