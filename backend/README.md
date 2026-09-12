# Backend — SERGI

API REST (Node.js + Express + TypeScript) que implementa la lógica de negocio
y el acceso a datos (PostgreSQL).

## Estructura (arquitectura por capas, RNF-MAN-01)

```
backend/
├── src/
│   ├── controllers/   # Capa de presentación (rutas/handlers)
│   ├── routes/        # Definición de routers de la API (montados en /api)
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Acceso a datos (PostgreSQL, pg crudo)
│   ├── models/        # Entidades / tipos
│   ├── middlewares/   # Auth, roles, manejo de errores
│   ├── config/        # Variables de entorno, conexión a BD, cifrado
│   ├── app.ts          # Configuración de Express (middlewares, rutas, 2-step build)
│   └── server.ts       # Punto de entrada, arranca el servidor HTTP
├── migrations/         # Migraciones de node-pg-migrate (esquema de BD)
├── migrations-utils/   # Helpers compartidos por las migraciones
├── .pgmigraterc        # Configuración de node-pg-migrate
├── package.json
└── tsconfig.json
```

## Setup local

1. Copiar `.env.example` a `.env` y completar los valores (como mínimo
   `DATABASE_URL` apuntando a tu Postgres local, o al del `docker-compose.yml`
   de la raíz si usas `db:5432` desde dentro de la red de Docker, o
   `localhost:5432` si corres el backend fuera de Docker). Definir también
   `EMBEDDING_ENC_KEY` (ver más abajo).
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar la base de datos (desde la raíz del repo):
   ```bash
   docker compose up -d db
   ```
4. Aplicar las migraciones y el seed (ver sección "Base de datos y migraciones"):
   ```bash
   npm run migrate:up
   ```
5. Correr el servidor en modo desarrollo (hot reload con `tsx watch`):
   ```bash
   npm run dev
   ```
6. Verificar que responde en [http://localhost:3000/health](http://localhost:3000/health).
   Debe devolver `200` con `"database":"connected"` si la conexión a Postgres
   es correcta.

### Variable de cifrado de embeddings (`EMBEDDING_ENC_KEY`)

Los embeddings faciales se guardan cifrados (RF-BIO-07 / RNF-SEG-04) con
AES-256-GCM a nivel de aplicación. Se requiere una clave de 32 bytes en `.env`.
Generarla con:

```bash
openssl rand -hex 32
```

El backend no arranca si la variable no está definida.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor en modo desarrollo con recarga en caliente. |
| `npm run build` | Compila TypeScript a `dist/`. |
| `npm start` | Corre el build compilado (`dist/server.js`). |
| `npm run lint` | Corre ESLint sobre todo el proyecto. |
| `npm run migrate:up` | Aplica todas las migraciones pendientes. |
| `npm run migrate:down` | Revierte la última migración (`down N` para varias). |
| `npm run migrate:create -- <nombre>` | Crea un nuevo archivo de migración. |

## Base de datos y migraciones

El esquema (entidades del ERS §6.1 + Anexo B) se gestiona con
[`node-pg-migrate`](https://github.com/salsita/node-pg-migrate). Las migraciones
están en `migrations/` (archivos `.js`, numerados `0001_…` en orden de
ejecución) y usan `DATABASE_URL` del entorno.

Convenciones: tablas en **singular snake_case en español**, tipos **ENUM
nativos** de PostgreSQL para valores fijos, y campos de auditoría comunes
(`status`, `created_at`, `created_by`, `updated_at`, `updated_by`) en todas las
tablas (helper compartido en `migrations-utils/audit.js`).

### Correr migraciones y seed

En local (backend fuera de Docker, con `DATABASE_URL` a `localhost:5432`):

```bash
docker compose up -d db      # desde la raíz del repo
npm run migrate:up           # aplica esquema + seed (roles base y configuración)
```

Dentro de Docker (usa el `DATABASE_URL` a `db:5432` inyectado por compose):

```bash
docker compose run --rm backend npm run migrate:up
```

El seed (`0007_seed.js`) crea los 4 roles base (`Miembro`, `Directivo`,
`Encargado de limpieza`, `Administrador`) y la configuración
`acceso.horas_max_dentro` (RF-ACC-05). Es idempotente.

### Endpoints del módulo de Control de Acceso (RF-ACC)

| Método y ruta | Descripción |
| --- | --- |
| `POST /api/acceso/eventos` | Registra un ingreso/salida (RF-ACC-01/02/03). Responde `409` si el evento no cambia la presencia (p. ej. una salida duplicada de quien ya está fuera), evitando cierres espurios. |
| `GET /api/acceso/presencia` | Miembros actualmente dentro del local (RF-ACC-04). |
| `GET /api/acceso/cierre/ultimo` | Último cierre y su responsable (handoff a RF-INC-02). |
| `POST /api/acceso/permanencia/verificar` | Genera alertas por permanencia excesiva (RF-ACC-05). Idempotente por estadía: solo notifica a los miembros aún no alertados, así invocarlo periódicamente (cron/polling) no reenvía la misma alerta. |
| `GET /api/configuracion/:clave` | Lee un valor de configuración. |
| `PUT /api/configuracion/:clave` | Actualiza el valor de una clave **existente** (las claves se crean por seed/migración). Responde `404` si la clave no existe y `400` si el valor no respeta el `tipo_dato` (p. ej. `integer` no negativo). |

> Los endpoints aún no están protegidos por auth/roles; eso se añade en el
> módulo de autenticación (issue #6).

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
