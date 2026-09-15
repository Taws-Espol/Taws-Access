# RF-NOT: notificaciones por WhatsApp

## Servicio reutilizable

Los módulos consumidores deben importar `enviarNotificacion` desde
`backend/src/services/notificacionService.ts`:

```ts
await enviarNotificacion({
  destinatario_id: miembroId,
  tipo: "incidencia",
  mensaje: "Se registró una nueva incidencia en el local.",
});
```

Para una plantilla aprobada por Meta se debe indicar el nombre exacto, el
idioma aprobado y los parámetros del cuerpo en el mismo orden en que aparecen
en la plantilla:

```ts
await enviarNotificacion({
  destinatario_id: miembroId,
  tipo: "incidencia",
  mensaje: "Nueva incidencia registrada.",
  plantilla: {
    nombre: "asignacion_incidencia",
    idioma: "es",
    parametros: ["Carlos", "15", "Puerta dañada en el ingreso"],
  },
});
```

El servicio registra la notificación, obtiene el teléfono del destinatario y
envía el mensaje mediante la API directa de WhatsApp Business. Los módulos
`RF-INC`, `RF-LIM` y `RF-BIO` son responsables de invocarlo en sus propios
flujos; no se duplican esos disparadores en RF-NOT.

## Plantillas aprobadas en Meta

El backend envía `type: "template"` a la API directa de WhatsApp Business.
Los nombres son sensibles a mayúsculas y deben coincidir con los creados en
Meta. Cada elemento de `parametros` se convierte en un parámetro de texto del
cuerpo (`{{1}}`, `{{2}}`, etc.).

| Requisito                           | Nombre en Meta          | Idioma | Parámetros, en orden                                     |
| ----------------------------------- | ----------------------- | ------ | -------------------------------------------------------- |
| RF-NOT-01, asignación de incidencia | `asignacion_incidencia` | `es`   | nombre del miembro, ID de incidencia, descripción        |
| RF-NOT-02, nueva incidencia         | `nueva_incidencia`      | `es`   | ID de incidencia, local, tipo de incidencia, descripción |
| Multa aplicada                      | `multa_aplicada`        | `en`   | monto, motivo, plazo de pago, ID de incidencia           |
| RF-NOT-03, tarea de limpieza        | `tarea_limpieza`        | `es`   | nombre del miembro, fecha, tarea, lugar                  |

### Contenido de las plantillas

`nueva_incidencia`:

```text
Se ha registrado una nueva incidencia #{{1}} en {{2}}.

Tipo: {{3}}

Descripción: {{4}}

Revisa el sistema para consultar los detalles y realizar el seguimiento correspondiente.
```

`asignacion_incidencia`:

```text
Hola {{1}}, se te ha asignado la responsabilidad de la incidencia #{{2}}.

Descripción registrada: {{3}}.

Revisa el sistema para consultar los detalles y completar el seguimiento correspondiente.
```

`multa_aplicada`:

```text
Se ha aplicado una multa de ${{1}} por el siguiente motivo: {{2}}.

El plazo de pago indicado es {{3}} y la multa está relacionada con la incidencia #{{4}}.

Revisa el sistema para consultar los detalles.
```

`tarea_limpieza`:

```text
Hola {{1}}, tienes asignada una tarea de limpieza para el día {{2}}.

Actividad: {{3}}.
Lugar asignado: {{4}}.

Revisa el sistema para consultar los detalles de la jornada.
```

Los templates `confirmacion_apelacion` y `resolucion_apelacion` quedan
reservados para una futura versión. Su contrato previsto es:

| Nombre en Meta           | Parámetros, en orden           |
| ------------------------ | ------------------------------ |
| `confirmacion_apelacion` | ID de multa                    |
| `resolucion_apelacion`   | ID de multa, resultado, motivo |

Ejemplos de invocación con los parámetros que corresponden a las plantillas
configuradas en Meta:

```ts
await enviarNotificacion({
  destinatario_id: miembroId,
  tipo: "incidencia",
  mensaje: "Prueba de asignación de incidencia.",
  plantilla: {
    nombre: "asignacion_incidencia",
    idioma: "es",
    parametros: ["Carlos", "15", "Puerta dañada en el ingreso"],
  },
});

await enviarNotificacion({
  destinatario_id: directivoId,
  tipo: "incidencia",
  mensaje: "Nueva incidencia registrada.",
  plantilla: {
    nombre: "nueva_incidencia",
    idioma: "es",
    parametros: [
      "15",
      "Local Norte",
      "Daño de infraestructura",
      "Se encontró una puerta dañada",
    ],
  },
});

await enviarNotificacion({
  destinatario_id: miembroId,
  tipo: "multa",
  mensaje: "Prueba de multa aplicada.",
  plantilla: {
    nombre: "multa_aplicada",
    idioma: "en",
    parametros: [
      "25.00",
      "Incumplimiento de una tarea",
      "30 de septiembre",
      "15",
    ],
  },
});

for (const miembroId of cincoMiembrosSeleccionados) {
  await enviarNotificacion({
    destinatario_id: miembroId,
    tipo: "limpieza",
    mensaje: "Prueba de tarea de limpieza.",
    plantilla: {
      nombre: "tarea_limpieza",
      idioma: "es",
      parametros: [
        "Carlos",
        "20 de septiembre",
        "Limpieza del área común",
        "Local Norte",
      ],
    },
  });
}
```

Los saltos de línea forman parte del contenido aprobado en Meta. No se deben
agregar, quitar ni reordenar parámetros al invocar una plantilla.

## Estados y reintentos

`notificacion.status` usa `pendiente`, `enviado`, `entregado` o `fallido`.
La API marca el mensaje como `enviado`; el webhook de Meta actualiza a
`entregado` o `fallido`. Los fallos se reintentan hasta tres veces, con cinco
minutos entre intentos. En la entidad `notificacion` solo se persisten
`status`, `intentos` y `timestamp_envio`. La programación del reintento y la
correlación temporal con Meta viven en memoria del proceso; si el backend se
reinicia antes de un reintento, ese reintento debe dispararse nuevamente desde
el módulo consumidor.

## Configuración

Definir en el entorno del backend:

```env
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_API_VERSION=v25.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...
```

Configurar en Meta estos endpoints públicos:

- `GET /api/notificaciones/whatsapp/webhook` para verificar el webhook.
- `POST /api/notificaciones/whatsapp/webhook` para recibir estados.

El webhook debe publicarse detrás de HTTPS y protegerse con la verificación de
Meta antes de habilitarlo en producción.
