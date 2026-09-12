import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { campoClase, etiquetaClase } from "@/components/limpieza/estilos";
import { listarEncargados, listarJornadas } from "@/services/limpiezaService";
import type {
  Encargado,
  FiltrosHistorialLimpieza,
  JornadaLimpiezaHistorial,
} from "@/types/limpieza";

// Historial completo de jornadas de limpieza, filtrable por fecha y encargado
// (RF-LIM-04). Es autocontenido para que el panel de auditoría (issue #12)
// pueda montarlo tal cual: <HistorialLimpieza />.

const formatoFecha = new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" });
const formatoHora = new Intl.DateTimeFormat("es-EC", { timeStyle: "short" });

interface Props {
  // Cambiar este valor fuerza a recargar el historial (p. ej. tras registrar
  // una jornada nueva en la misma pantalla).
  recarga?: number;
}

interface Resultado {
  // Consulta (filtros + recarga) a la que corresponde este resultado.
  consulta: string;
  jornadas: JornadaLimpiezaHistorial[];
  error: string | null;
}

export function HistorialLimpieza({ recarga = 0 }: Props) {
  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [filtros, setFiltros] = useState<FiltrosHistorialLimpieza>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // El historial está "cargando" mientras el último resultado recibido no
  // corresponda a los filtros actuales.
  const consulta = JSON.stringify({ ...filtros, recarga });
  const cargando = resultado?.consulta !== consulta;
  const jornadas = resultado?.jornadas ?? [];
  const error = resultado?.error ?? null;

  useEffect(() => {
    let cancelado = false;
    listarEncargados().then((lista) => {
      if (!cancelado) setEncargados(lista);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    listarJornadas(filtros).then(
      (lista) => {
        if (!cancelado) setResultado({ consulta, jornadas: lista, error: null });
      },
      () => {
        if (!cancelado) {
          setResultado({
            consulta,
            jornadas: [],
            error: "No se pudo cargar el historial de limpieza.",
          });
        }
      },
    );
    return () => {
      cancelado = true;
    };
  }, [consulta, filtros]);

  const rangoInvalido = Boolean(filtros.desde && filtros.hasta && filtros.desde > filtros.hasta);
  const hayFiltros = Boolean(filtros.desde || filtros.hasta || filtros.encargadoId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1.5fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="historial-desde" className={etiquetaClase}>
            Desde
          </label>
          <input
            id="historial-desde"
            type="date"
            value={filtros.desde ?? ""}
            max={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value || undefined }))}
            className={campoClase}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="historial-hasta" className={etiquetaClase}>
            Hasta
          </label>
          <input
            id="historial-hasta"
            type="date"
            value={filtros.hasta ?? ""}
            min={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value || undefined }))}
            className={campoClase}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="historial-encargado" className={etiquetaClase}>
            Encargado
          </label>
          <select
            id="historial-encargado"
            value={filtros.encargadoId ?? ""}
            onChange={(e) =>
              setFiltros((f) => ({
                ...f,
                encargadoId: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            className={campoClase}
          >
            <option value="">Todos</option>
            {encargados.map((encargado) => (
              <option key={encargado.id} value={encargado.id}>
                {encargado.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="lg"
          disabled={!hayFiltros}
          onClick={() => setFiltros({})}
        >
          Limpiar filtros
        </Button>
      </div>

      {rangoInvalido ? (
        <p role="alert" className="text-sm text-destructive">
          La fecha "Desde" no puede ser posterior a "Hasta".
        </p>
      ) : cargando ? (
        <p className="text-sm text-muted-foreground">Cargando historial...</p>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : jornadas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hayFiltros
            ? "No hay jornadas de limpieza que coincidan con los filtros."
            : "Todavía no hay jornadas de limpieza registradas."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Fecha</th>
                <th scope="col" className="px-3 py-2 font-medium">Encargado</th>
                <th scope="col" className="px-3 py-2 font-medium">Horario</th>
                <th scope="col" className="px-3 py-2 font-medium">Observaciones</th>
                <th scope="col" className="px-3 py-2 font-medium">Evidencia</th>
              </tr>
            </thead>
            <tbody>
              {jornadas.map((jornada) => {
                const inicio = new Date(jornada.inicio_timestamp);
                return (
                  <tr key={jornada.id} className="border-t">
                    <td className="px-3 py-2 whitespace-nowrap">{formatoFecha.format(inicio)}</td>
                    <td className="px-3 py-2">{jornada.encargado_nombre}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatoHora.format(inicio)}
                      {jornada.fin_timestamp &&
                        ` – ${formatoHora.format(new Date(jornada.fin_timestamp))}`}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {jornada.observaciones ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {jornada.evidencia_url ? (
                        <a
                          href={jornada.evidencia_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Ver foto
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Sin foto</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
