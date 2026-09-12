import type {
  Encargado,
  FiltrosHistorialLimpieza,
  JornadaLimpiezaHistorial,
  NuevaJornadaLimpieza,
} from "@/types/limpieza";

// Servicio del módulo de Registro de Limpieza (RF-LIM, issue #9).
//
// TODO(#9): por ahora trabaja con datos de prueba en memoria, porque la tabla
// `jornada_limpieza` todavía no existe en `main` (llega con el esquema de BD
// del PR #18). Cuando el backend exponga los endpoints, reemplazar cada función
// por su llamada real manteniendo la misma firma, p. ej.:
//   listarJornadas  → GET  /api/limpieza/jornadas?desde=&hasta=&encargadoId=
//   registrarJornada → POST /api/limpieza/jornadas (multipart/form-data, por la foto)

const RETARDO_SIMULADO_MS = 300;

function esperar() {
  return new Promise((resolve) => setTimeout(resolve, RETARDO_SIMULADO_MS));
}

// Imagen de relleno para las jornadas de prueba (no son fotos reales). Se usa
// una URL blob: y no data: porque el navegador bloquea abrir data: en otra pestaña.
function fotoDeEjemplo(texto: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="100%" height="100%" fill="#e5e5e5"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#737373" text-anchor="middle" dominant-baseline="middle">${texto}</text></svg>`;
  return URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
}

const encargadosMock: Encargado[] = [
  { id: 1, nombre: "Ana Torres" },
  { id: 2, nombre: "Luis Mendoza" },
  { id: 3, nombre: "Carla Ríos" },
  { id: 4, nombre: "Diego Paredes" },
  { id: 5, nombre: "Sofía Vera" },
];

let jornadasMock: JornadaLimpiezaHistorial[] = [
  {
    id: 1,
    encargado_id: 1,
    encargado_nombre: "Ana Torres",
    inicio_timestamp: "2026-08-24T15:00:00.000Z",
    fin_timestamp: "2026-08-24T16:10:00.000Z",
    observaciones: "Se limpió el área de computadoras.",
    evidencia_url: fotoDeEjemplo("Evidencia de ejemplo 1"),
  },
  {
    id: 2,
    encargado_id: 3,
    encargado_nombre: "Carla Ríos",
    inicio_timestamp: "2026-08-31T14:30:00.000Z",
    fin_timestamp: "2026-08-31T15:15:00.000Z",
    observaciones: null,
    evidencia_url: fotoDeEjemplo("Evidencia de ejemplo 2"),
  },
  {
    id: 3,
    encargado_id: 2,
    encargado_nombre: "Luis Mendoza",
    inicio_timestamp: "2026-09-04T17:00:00.000Z",
    fin_timestamp: "2026-09-04T18:00:00.000Z",
    observaciones: "Faltaban fundas de basura.",
    evidencia_url: fotoDeEjemplo("Evidencia de ejemplo 3"),
  },
  {
    id: 4,
    encargado_id: 5,
    encargado_nombre: "Sofía Vera",
    inicio_timestamp: "2026-09-08T13:45:00.000Z",
    fin_timestamp: "2026-09-08T14:30:00.000Z",
    observaciones: null,
    evidencia_url: fotoDeEjemplo("Evidencia de ejemplo 4"),
  },
];

// Fecha local (YYYY-MM-DD) de un timestamp ISO, para comparar con los filtros.
export function fechaLocal(iso: string) {
  const fecha = new Date(iso);
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Miembro que tiene la sesión iniciada.
// TODO(#6): obtenerlo del módulo de autenticación cuando exista.
export async function obtenerMiembroActual(): Promise<Encargado> {
  await esperar();
  return encargadosMock[0];
}

export async function listarEncargados(): Promise<Encargado[]> {
  await esperar();
  return [...encargadosMock];
}

// Historial de jornadas, de la más reciente a la más antigua (RF-LIM-04).
export async function listarJornadas(
  filtros: FiltrosHistorialLimpieza = {},
): Promise<JornadaLimpiezaHistorial[]> {
  await esperar();
  return jornadasMock
    .filter((jornada) => {
      const fecha = fechaLocal(jornada.inicio_timestamp);
      if (filtros.desde && fecha < filtros.desde) return false;
      if (filtros.hasta && fecha > filtros.hasta) return false;
      if (filtros.encargadoId && jornada.encargado_id !== filtros.encargadoId) return false;
      return true;
    })
    .sort((a, b) => b.inicio_timestamp.localeCompare(a.inicio_timestamp));
}

// Registra la jornada del miembro actual con su foto de evidencia (RF-LIM-02/03).
export async function registrarJornada(
  datos: NuevaJornadaLimpieza,
): Promise<JornadaLimpiezaHistorial> {
  const encargado = await obtenerMiembroActual();
  const jornada: JornadaLimpiezaHistorial = {
    id: Math.max(0, ...jornadasMock.map((j) => j.id)) + 1,
    encargado_id: encargado.id,
    encargado_nombre: encargado.nombre,
    inicio_timestamp: datos.inicio_timestamp,
    fin_timestamp: datos.fin_timestamp,
    observaciones: datos.observaciones,
    // En el mock la foto solo vive en memoria del navegador; el backend
    // devolverá la URL real donde quedó guardada.
    evidencia_url: URL.createObjectURL(datos.foto),
  };
  jornadasMock = [...jornadasMock, jornada];
  return jornada;
}
