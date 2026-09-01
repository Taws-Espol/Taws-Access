# Facial Service — SERGI

Microservicio en Python encargado de generar y comparar embeddings faciales
con DeepFace. Es consumido internamente por el `backend/` (vía
`FACIAL_SERVICE_URL`); el cliente nunca lo llama directamente.

> **RF-BIO-07 / RNF-SEG-04**: este servicio no persiste imágenes en ningún
> momento. La imagen recibida en `/embeddings` se decodifica en memoria
> únicamente para calcular el embedding y se descarta al terminar el
> request.

## Decisión técnica: FastAPI

Se eligió **FastAPI** sobre Flask por:

- Validación de request/response con Pydantic, sin código repetido a mano.
- Documentación interactiva automática (`/docs`, `/redoc`).
- Soporte async nativo, útil de cara a escalar horizontalmente (RNF-ESC-01).

## Estructura

```
facial-service/
├── app/
│   ├── main.py        # Endpoints FastAPI (/health, /embeddings, /match)
│   ├── config.py      # Variables de entorno
│   ├── schemas.py     # Modelos Pydantic (request/response)
│   ├── embeddings.py  # Generación de embeddings (DeepFace)
│   └── matching.py    # Comparación de embeddings (similitud coseno)
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Setup local (sin Docker)

1. Crear un entorno virtual e instalar dependencias:

   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Copiar `.env.example` a `.env` (los valores por defecto ya sirven para
   desarrollo local).

3. Levantar el servidor de desarrollo:

   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

4. Abrir [http://localhost:8000/docs](http://localhost:8000/docs) para la
   documentación interactiva (Swagger UI).

> La primera vez que se llama a `/embeddings`, DeepFace descarga los pesos
> del modelo configurado (`FACIAL_MODEL_NAME`); requiere conexión a internet
> y puede tardar unos segundos.

## Setup con Docker

```bash
docker build -t sergi-facial-service .
docker run --env-file .env -p 8000:8000 sergi-facial-service
```

La integración de este servicio dentro de `docker-compose.yml` (raíz del
repo) se hace en el issue de infraestructura de Docker Compose.

## Endpoints

### `GET /health`

Chequeo básico de disponibilidad.

```json
{ "status": "ok", "model": "Facenet512" }
```

### `POST /embeddings`

Genera el embedding facial de una imagen ya recortada por MediaPipe en el
cliente.

Request:

```json
{
  "image_base64": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

También acepta el prefijo `data:image/jpeg;base64,...` tal como lo genera
`canvas.toDataURL()` en el navegador.

Response `200`:

```json
{
  "embedding": [0.0123, -0.0456, "... (512 valores para Facenet512)"],
  "model": "Facenet512"
}
```

Errores:

- `400` — la imagen no se pudo decodificar.
- `500` — DeepFace falló al generar el embedding.

### `POST /match`

Compara un embedding contra una lista de embeddings almacenados y devuelve
el de mayor similitud, siempre que supere el umbral configurado (RF-BIO-02).

Request:

```json
{
  "embedding": [0.0123, -0.0456],
  "candidates": [
    { "id": "socio-1", "embedding": [0.011, -0.048] },
    { "id": "socio-2", "embedding": [0.51, 0.22] }
  ],
  "threshold": 0.6
}
```

`threshold` es opcional; si se omite, se usa `FACIAL_MATCH_THRESHOLD`.

Response `200` (con coincidencia):

```json
{
  "match": { "id": "socio-1", "score": 0.87 },
  "threshold": 0.6
}
```

Response `200` (sin coincidencia por debajo del umbral):

```json
{
  "match": null,
  "threshold": 0.6
}
```

## Variables de entorno

| Variable | Descripción | Default |
| --- | --- | --- |
| `PORT` | Puerto del servidor | `8000` |
| `FACIAL_MODEL_NAME` | Modelo de DeepFace usado para generar embeddings | `Facenet512` |
| `FACIAL_MATCH_THRESHOLD` | Umbral de similitud coseno por defecto para `/match` | `0.6` |

## Requisitos relacionados

- RF-BIO-02 (comparación de embeddings con umbral configurable)
- RF-BIO-05 (registro de embeddings de nuevos miembros)
- RF-BIO-07 / RNF-SEG-04 (no se almacenan imágenes, solo embeddings encriptados)
- RNF-ESC-01 (escalar horizontalmente el servicio de reconocimiento facial)
