# SERGI — Sistema de Registro Biométrico y Gestión de Incidencias

Proyecto del **Club Taws** (ESPOL). Aplicación web que automatiza el control de
acceso al local del club mediante reconocimiento facial, el registro de jornadas
de limpieza y la gestión de incidencias/multas, con notificaciones automáticas
por WhatsApp.

La especificación completa de requisitos está en
[`docs/ERS_SERGI_v1.1.pdf`](docs/ERS_SERGI_v1.1.pdf).

## Equipo

| Persona | Rol |
| --- | --- |
| Javier Gutiérrez | Líder |
| José Adrián | Co-líder |
| Andrés Saltos | Desarrollador |
| Nahin Cevallos | Desarrollador |
| Victor Morales | Desarrollador |
| Melissa Suarez | Desarrollador |

## Arquitectura y stack

Arquitectura de tres capas desacopladas (ver sección 7 del ERS):

| Capa | Tecnología | Carpeta |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript + Shadcn/ui | [`frontend/`](frontend/) |
| Backend / API | Node.js + Express + TypeScript | [`backend/`](backend/) |
| Reconocimiento facial | MediaPipe (cliente) + DeepFace (microservicio Python) | [`facial-service/`](facial-service/) |
| Base de datos | PostgreSQL | — |
| Notificaciones | WhatsApp Business API | — |
| Infraestructura | Docker / Docker Compose | [`docker-compose.yml`](docker-compose.yml) |

Durante desarrollo se compila el frontend y se sirve estáticamente desde el
backend (Express), de forma que solo se necesita 1 servidor + 1 base de datos
en producción.

## Cómo empezar

1. Clonar el repo y copiar `.env.example` a `.env` en la raíz, `backend/` y
   `facial-service/`, completando los valores necesarios.
2. Levantar los servicios con Docker Compose:

   ```bash
   docker compose up --build
   ```

3. Cada subcarpeta (`frontend/`, `backend/`, `facial-service/`) tiene su
   propio README con instrucciones específicas de desarrollo. **Estas
   carpetas todavía son esqueletos**: el setup real de cada una se hace en
   los issues de infraestructura (ver tablero de Issues).

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
