# La Casa de Monchita Delivery — Frontend (React + Vite + TS + Tailwind)
Tema: **negro y dorado** · Rutas: Registro, Login, Olvidé, Reset, Mis pedidos (protegida).

## Requisitos
- Node.js LTS
- NPM

## Arranque rápido (modo MOCK sin backend)
```bash
npm install
# activamos el modo mock
echo "VITE_USE_MOCK=1" > .env
npm run dev
```
Abre la URL de la terminal (p. ej., http://localhost:5173).

## Conectar a backend real
- Borra/edita `.env` para usar:
```
VITE_API_URL=http://localhost:3000/api
VITE_USE_MOCK=0
```
- Implementa endpoints reales en tu servidor:
  - POST /auth/register
  - POST /auth/login
  - GET /auth/me
  - POST /auth/logout
  - POST /auth/forgot
  - POST /auth/reset
  - GET /orders
  - POST /orders

## Seguridad (notas)
- El **mock** guarda datos en localStorage (sólo para desarrollo). En producción, **no** guardar contraseñas; usar hash (bcrypt/argon2) y cifrado en servidor.
- Sesión: en real, usa **cookies httpOnly** y **expiración por inactividad** en backend.

## Paleta
- Negro (`#0a0a0a`) y Dorado (`#D4AF37`).

## Scripts
- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run preview` — sirve la build local

