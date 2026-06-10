# Backend — SERGI

API REST (Node.js + Express + TypeScript) que implementa la lógica de negocio
y el acceso a datos (PostgreSQL).

> Esta carpeta es un placeholder. El setup inicial (scaffolding de
> Express+TS, arquitectura por capas, conexión a PostgreSQL, 2-step build
> para servir el frontend) se realiza en el issue de infraestructura
> correspondiente.

## Estructura propuesta (arquitectura por capas, RNF-MAN-01)

```
backend/
├── src/
│   ├── controllers/   # Capa de presentación (rutas/handlers)
│   ├── services/      # Lógica de negocio
│   ├── repositories/  # Acceso a datos (PostgreSQL)
│   ├── models/        # Entidades / tipos
│   ├── middlewares/    # Auth, roles, manejo de errores
│   └── config/
├── package.json
└── tsconfig.json
```

## Requisitos relacionados

- RNF-MAN-01 (arquitectura por capas)
- RNF-SEG-01/02 (HTTPS, roles y permisos)
- Comunicación con `facial-service/` y con la API de WhatsApp Business
