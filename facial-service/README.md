# Facial Service — SERGI

Microservicio en Python encargado de generar y comparar embeddings faciales
con DeepFace, ejecutado como contenedor independiente y consumido por el
backend.

> Esta carpeta es un placeholder. El setup inicial (Dockerfile, dependencias,
> endpoints de generación/comparación de embeddings) se realiza en el issue
> de infraestructura correspondiente.

## Estructura propuesta

```
facial-service/
├── app/
│   ├── main.py        # API (FastAPI/Flask)
│   ├── embeddings.py  # Generación de embeddings (DeepFace)
│   └── matching.py    # Comparación contra embeddings almacenados
├── Dockerfile
└── requirements.txt
```

## Requisitos relacionados

- RF-BIO-02 (comparación de embeddings con umbral configurable)
- RF-BIO-05 (registro de embeddings de nuevos miembros)
- RF-BIO-07 / RNF-SEG-04 (no se almacenan imágenes, solo embeddings encriptados)
- RNF-ESC-01 (escalar horizontalmente el servicio de reconocimiento facial)
