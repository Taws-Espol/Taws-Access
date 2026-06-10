# Frontend — SERGI

Cliente web (React + Vite + TypeScript + Shadcn/ui) que consume la API REST
del backend.

> Esta carpeta es un placeholder. El setup inicial (scaffolding con Vite,
> configuración de Shadcn/ui, estructura de carpetas, cliente HTTP hacia el
> backend) se realiza en el issue de infraestructura correspondiente.

## Estructura propuesta

```
frontend/
├── src/
│   ├── components/   # Componentes reutilizables (UI)
│   ├── pages/         # Vistas / rutas
│   ├── services/       # Llamadas a la API REST
│   ├── hooks/
│   └── types/
├── index.html
├── package.json
└── vite.config.ts
```

## Requisitos relacionados

- RNF-USA-01, RNF-USA-02, RNF-USA-03 (usabilidad y responsive)
- RF-AUD-01/02/03 (panel de auditoría)
