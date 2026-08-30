# Frontend — SERGI

Cliente web (React + Vite + TypeScript + Shadcn/ui) que consume la API REST
del backend.

## Estructura

```
frontend/
├── src/
│   ├── components/ui/  # Componentes de Shadcn/ui
│   ├── pages/            # Vistas / rutas principales (login, acceso, auditoría, incidencias, limpieza)
│   ├── services/          # Cliente HTTP hacia la API del backend
│   ├── hooks/
│   ├── types/
│   └── lib/               # Utilidades (helper `cn` de Shadcn)
├── index.html
├── package.json
└── vite.config.ts
```

## Setup local

1. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL` si el backend no
   corre en `http://localhost:3000`.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abrir [http://localhost:5173](http://localhost:5173).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Levanta el servidor de desarrollo con recarga en caliente. |
| `npm run build` | Type-checks y genera el build de producción en `dist/`. |
| `npm run lint` | Corre `oxlint` sobre el proyecto. |
| `npm run preview` | Sirve el build de `dist/` localmente para previsualizar. |

## Rutas

| Ruta | Página | Módulo relacionado |
| --- | --- | --- |
| `/login` | Login | Autenticación (#6) |
| `/acceso` | Registro de acceso | Reconocimiento facial (#7) / Control de acceso (#8) |
| `/auditoria` | Panel de auditoría | Auditoría (#12) |
| `/incidencias` | Incidencias | Gestión de incidencias (#10) |
| `/limpieza` | Limpieza | Registro de limpieza (#9) |

Todas las páginas son placeholders por ahora; la pantalla real de cada una se
implementa en su issue de módulo correspondiente.

## Cliente HTTP

`src/services/api.ts` expone un cliente mínimo (`api.get`, `api.post`) que
apunta a `VITE_API_URL`. Los servicios de cada módulo deben construirse sobre
esta base en vez de llamar a `fetch` directamente.

## Añadir componentes de Shadcn/ui

```bash
npx shadcn@latest add <componente>
```

## Requisitos relacionados

- RNF-USA-01, RNF-USA-02, RNF-USA-03 (usabilidad y responsive)
- RF-AUD-01/02/03 (panel de auditoría)
