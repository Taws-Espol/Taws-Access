# SERGI — Sistema de Registro Biométrico y Gestión de Incidencias

Proyecto del **Club Taws** (ESPOL). Aplicación web que automatiza el control de
acceso al local del club mediante reconocimiento facial, el registro de jornadas
de limpieza y la gestión de incidencias/multas, con notificaciones automáticas
por WhatsApp.

La especificación completa de requisitos está en
[`docs/ERS_SERGI_v1.1.pdf`](docs/ERS_SERGI_v1.1.pdf).

## Equipo

| Persona          | Rol           |
| ---------------- | ------------- |
| Javier Gutiérrez | Líder         |
| José Adrián      | Co-líder      |
| Andrés Saltos    | Desarrollador |
| Nahin Cevallos   | Desarrollador |
| Victor Morales   | Desarrollador |
| Melissa Suarez   | Desarrollador |

## Arquitectura y stack

Arquitectura de tres capas desacopladas (ver sección 7 del ERS):

| Capa                  | Tecnología                                            | Carpeta                                    |
| --------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Frontend              | React + Vite + TypeScript + Shadcn/ui                 | [`frontend/`](frontend/)                   |
| Backend / API         | Node.js + Express + TypeScript                        | [`backend/`](backend/)                     |
| Reconocimiento facial | MediaPipe (cliente) + DeepFace (microservicio Python) | [`facial-service/`](facial-service/)       |
| Base de datos         | PostgreSQL                                            | —                                          |
| Notificaciones        | WhatsApp Business API                                 | —                                          |
| Infraestructura       | Docker / Docker Compose                               | [`docker-compose.yml`](docker-compose.yml) |

Durante desarrollo se puede ejecutar el frontend por separado con Vite, y en
producción se sigue el patrón de 2-step build del ERS: el frontend se compila y
luego es servido estáticamente por el backend (Express). La base de datos y los
servicios auxiliares quedan levantados con Docker Compose para un despliegue
reproducible en el servidor del club.

## Cómo empezar

1. Clonar el repo y crear un archivo `.env` en la raíz a partir de
   `.env.example`:

   ```bash
   cp .env.example .env
   ```

2. Ajustar los valores sensibles, especialmente `POSTGRES_PASSWORD`,
   `JWT_SECRET` y los tokens de WhatsApp.
3. Levantar los servicios con Docker Compose:

   ```bash
   docker compose up --build
   ```

4. Verificar que el backend responde en `http://localhost:3000/health` y que
   el facial-service responde en `http://localhost:8000/health`.

   ```bash
   curl http://localhost:3000/health
   curl http://localhost:8000/health
   ```

> El frontend se mantiene en desarrollo con `npm run dev` desde la carpeta
> `frontend/` cuando se necesita inspección rápida. En producción, el ERS
> contempla el patrón de 2-step build y el backend sirve el bundle compilado.

> El `facial-service` ya está implementado con su Dockerfile y queda integrado
> dentro de la red de Docker Compose del proyecto. El servicio expone `/health`,
> `/embeddings` y `/match`, y puede levantarse con el entorno completo del repo
> sin requerir pasos adicionales fuera de la configuración del `.env`.

### Servicios incluidos en Docker Compose

- `db`: PostgreSQL 16.
- `backend`: API Node.js, depende de `db` y se conecta a `facial-service`
  mediante `FACIAL_SERVICE_URL`.
- `facial-service`: servicio Python base para reconocimiento facial.
- `db-backup`: contenedor con cron para respaldos automáticos diarios de la
  base de datos (RNF-DIS-03).

### Respaldos automáticos diarios

El servicio `db-backup` monta el directorio local `./backups` y ejecuta un cron
que realiza un `pg_dump` diario según `BACKUP_SCHEDULE` (por defecto `0 2 * * *`).
Los archivos generados quedan en:

```bash
./backups/
```

> Este directorio es de almacenamiento local del entorno y no debe subirse a Git.
> Los respaldos son datos sensibles y deben mantenerse fuera del repositorio.

Si quieres ajustar la frecuencia, modifica `BACKUP_SCHEDULE` en el `.env` de la
raíz y reinicia el servicio:

```bash
docker compose up -d --force-recreate db-backup
```

Para verificar que el backup funciona en este momento, puedes ejecutar una prueba
manual desde la raíz del proyecto:

```bash
docker compose exec db-backup sh -lc "PGPASSWORD=sergi pg_dump -h db -U sergi -d sergi -Fc > /backups/manual-test.dump && ls -l /backups"
```

Si genera un archivo `.dump`, la copia de seguridad está funcionando correctamente.
Para restaurar desde un respaldo:

```bash
ls -l backups
# ejemplo de restauración
pg_restore -U sergi -d sergi backups/sergi-YYYY-MM-DD.dump
```

> Si el despliegue se hace en el servidor del club, este mismo patrón puede
> dejarse como servicio del sistema de forma permanente; por ahora el compose
> lo deja operativo y reproducible dentro del repo, manteniendo los backups
> fuera del control de versiones.

### Validación final del issue

La verificación necesaria para cerrar el issue es la siguiente:

```bash
docker compose up --build
docker compose ps
curl http://localhost:3000/health
docker compose exec backend sh -lc "wget -qO- http://facial-service:8000/health"
docker compose exec db-backup sh -lc "PGPASSWORD=sergi pg_dump -h db -U sergi -d sergi -Fc > /backups/manual-test.dump && ls -l /backups"
```

Con esta validación se confirma que:

- `db`, `backend` y `facial-service` levantan con Docker Compose;
- el backend responde en `/health`;
- el backend puede comunicarse con `facial-service` dentro de la red interna;
- la copia de seguridad de PostgreSQL genera archivos `.dump` correctamente.

### Desarrollo local

En desarrollo, el frontend puede ejecutarse por separado con `npm run dev`
si se necesita inspección rápida; la producción sigue el patrón de 2-step
build del ERS, donde el frontend se compila y luego es servido por el backend.

Cada subcarpeta (`frontend/`, `backend/`, `facial-service/`) tiene su propio
README con instrucciones específicas de desarrollo. Las piezas que aún no
están implementadas se mantienen como trabajo pendiente del issue de
infraestructura correspondiente.

## Flujo de trabajo

- Cada tarea se gestiona como un **Issue** en GitHub, etiquetado por módulo
  (`RF-BIO`, `RF-ACC`, `RF-LIM`, `RF-INC`, `RF-NOT`, `RF-AUD`, `infra`) y por
  prioridad (`prioridad-alta`, `prioridad-media`, `prioridad-baja`).
- Crear una rama por issue (`feature/<modulo>-<descripcion-corta>`), abrir un
  Pull Request hacia `main` y vincularlo al issue correspondiente.
- Antes de mergear, revisar que el PR no rompa el build de `frontend/` ni de
  `backend/`.

## Modelo de datos

El modelo de datos preliminar (entidades, atributos y relaciones) está
documentado en la sección 6 y el Anexo B del ERS.
