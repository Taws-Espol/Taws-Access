# Backend — SERGI

API REST (Node.js + Express + TypeScript) que implementa la lógica de negocio
y el acceso a datos (PostgreSQL).

## Estructura (arquitectura por capas, RNF-MAN-01)

```
backend/
├── src/
│   ├── controllers/   # Capa de presentación (rutas/handlers)
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Acceso a datos (PostgreSQL) — se implementa en la issue #5
│   ├── models/        # Entidades / tipos — se implementa en la issue #5
│   ├── middlewares/   # Auth, roles, manejo de errores
│   ├── config/        # Variables de entorno, conexión a BD
│   ├── app.ts          # Configuración de Express (middlewares, rutas, 2-step build)
│   └── server.ts       # Punto de entrada, arranca el servidor HTTP
├── package.json
└── tsconfig.json
```

## Setup local

1. Copiar `.env.example` a `.env` y completar los valores (como mínimo
   `DATABASE_URL` apuntando a tu Postgres local, o al del `docker-compose.yml`
   de la raíz si usas `db:5432` desde dentro de la red de Docker, o
   `localhost:5432` si corres el backend fuera de Docker).
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar la base de datos (desde la raíz del repo):
   ```bash
   docker compose up -d db
   ```
4. Correr el servidor en modo desarrollo (hot reload con `tsx watch`):
   ```bash
   npm run dev
   ```
5. Verificar que responde en [http://localhost:3000/health](http://localhost:3000/health).
   Debe devolver `200` con `"database":"connected"` si la conexión a Postgres
   es correcta.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor en modo desarrollo con recarga en caliente. |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Corre el build compilado (`dist/server.js`). |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |

## Servir el frontend (2-step build)

En producción, Express sirve estáticamente el build del frontend
(`frontend/dist`) para no necesitar un servidor aparte (ver sección 7.2 del
ERS). Esto ya está configurado en `src/app.ts`: primero se compila el
frontend (`npm run build` dentro de `frontend/`), y luego el backend sirve
esos archivos automáticamente. Si `frontend/dist` todavía no existe, las
rutas de la API (`/health`, etc.) siguen funcionando con normalidad.

## HTTPS / TLS (producción)

RNF-SEG-01 exige que la comunicación cliente-servidor sea exclusivamente
por HTTPS (TLS 1.2+). Este proyecto no termina TLS en el propio proceso de
Node — en el servidor del club se debe colocar un reverse proxy (por
ejemplo Nginx con Let's Encrypt) delante del backend, que termine TLS y
reenvíe el tráfico a Express por HTTP en la red interna. La configuración
concreta del proxy se documentará en el issue de infraestructura de
despliegue.

## Requisitos relacionados

- RNF-MAN-01 (arquitectura por capas)
- RNF-SEG-01/02 (HTTPS, roles y permisos)
- Comunicación con `facial-service/` y con la API de WhatsApp Business
