import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { campoClase, etiquetaClase } from "@/components/limpieza/estilos";
import { fechaLocal, obtenerMiembroActual, registrarJornada } from "@/services/limpiezaService";
import type { Encargado, JornadaLimpiezaHistorial } from "@/types/limpieza";

// Formulario para que un miembro asignado registre su jornada de limpieza con
// la hora y una foto de evidencia (RF-LIM-02).

const TAMANO_MAXIMO_FOTO_MB = 5;
const LARGO_MAXIMO_OBSERVACIONES = 500;

type Campo = "fecha" | "horaInicio" | "horaFin" | "observaciones" | "foto";
type Errores = Partial<Record<Campo, string>>;

interface Valores {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones: string;
  foto: File | null;
}

function validar(valores: Valores): Errores {
  const errores: Errores = {};
  const hoy = fechaLocal(new Date().toISOString());

  if (!valores.fecha) errores.fecha = "Indica la fecha de la limpieza.";
  else if (valores.fecha > hoy) errores.fecha = "La fecha no puede estar en el futuro.";

  if (!valores.horaInicio) errores.horaInicio = "Indica la hora de inicio.";
  if (!valores.horaFin) errores.horaFin = "Indica la hora de fin.";
  else if (valores.horaInicio && valores.horaFin <= valores.horaInicio) {
    errores.horaFin = "La hora de fin debe ser posterior a la de inicio.";
  } else if (valores.fecha && new Date(`${valores.fecha}T${valores.horaFin}`) > new Date()) {
    errores.horaFin = "La hora de fin no puede estar en el futuro.";
  }

  if (valores.observaciones.length > LARGO_MAXIMO_OBSERVACIONES) {
    errores.observaciones = `Máximo ${LARGO_MAXIMO_OBSERVACIONES} caracteres.`;
  }

  if (!valores.foto) errores.foto = "Sube una foto como evidencia de la limpieza.";
  else if (!valores.foto.type.startsWith("image/")) errores.foto = "El archivo debe ser una imagen.";
  else if (valores.foto.size > TAMANO_MAXIMO_FOTO_MB * 1024 * 1024) {
    errores.foto = `La foto no puede pesar más de ${TAMANO_MAXIMO_FOTO_MB} MB.`;
  }

  return errores;
}

function valoresIniciales(): Valores {
  return {
    fecha: fechaLocal(new Date().toISOString()),
    horaInicio: "",
    horaFin: "",
    observaciones: "",
    foto: null,
  };
}

interface Props {
  onRegistrado?: (jornada: JornadaLimpiezaHistorial) => void;
}

export function RegistroLimpiezaForm({ onRegistrado }: Props) {
  const [miembro, setMiembro] = useState<Encargado | null>(null);
  const [valores, setValores] = useState<Valores>(valoresIniciales);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelado = false;
    obtenerMiembroActual().then((m) => {
      if (!cancelado) setMiembro(m);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // La vista previa usa una URL temporal del navegador; se libera al cambiar
  // de foto o al desmontar el componente.
  const vistaPreviaRef = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (vistaPreviaRef.current) URL.revokeObjectURL(vistaPreviaRef.current);
    },
    [],
  );

  function cambiarFoto(foto: File | null) {
    if (vistaPreviaRef.current) URL.revokeObjectURL(vistaPreviaRef.current);
    vistaPreviaRef.current = foto ? URL.createObjectURL(foto) : null;
    setVistaPrevia(vistaPreviaRef.current);
    actualizar("foto", foto);
  }

  function actualizar<K extends keyof Valores>(campo: K, valor: Valores[K]) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setExito(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nuevosErrores = validar(valores);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0 || !valores.foto) return;

    setEnviando(true);
    setErrorEnvio(null);
    try {
      const jornada = await registrarJornada({
        inicio_timestamp: new Date(`${valores.fecha}T${valores.horaInicio}`).toISOString(),
        fin_timestamp: new Date(`${valores.fecha}T${valores.horaFin}`).toISOString(),
        observaciones: valores.observaciones.trim() || null,
        foto: valores.foto,
      });
      cambiarFoto(null);
      setValores(valoresIniciales());
      if (inputFotoRef.current) inputFotoRef.current.value = "";
      setExito(true);
      onRegistrado?.(jornada);
    } catch {
      setErrorEnvio("No se pudo registrar la jornada. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const hoy = fechaLocal(new Date().toISOString());

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Registrando como:{" "}
        <span className="font-medium text-foreground">{miembro?.nombre ?? "Cargando..."}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="limpieza-fecha" className={etiquetaClase}>
            Fecha
          </label>
          <input
            id="limpieza-fecha"
            type="date"
            max={hoy}
            value={valores.fecha}
            onChange={(e) => actualizar("fecha", e.target.value)}
            aria-invalid={Boolean(errores.fecha)}
            aria-describedby={errores.fecha ? "limpieza-fecha-error" : undefined}
            className={campoClase}
          />
          {errores.fecha && (
            <p id="limpieza-fecha-error" className="text-sm text-destructive">
              {errores.fecha}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="limpieza-inicio" className={etiquetaClase}>
            Hora de inicio
          </label>
          <input
            id="limpieza-inicio"
            type="time"
            value={valores.horaInicio}
            onChange={(e) => actualizar("horaInicio", e.target.value)}
            aria-invalid={Boolean(errores.horaInicio)}
            aria-describedby={errores.horaInicio ? "limpieza-inicio-error" : undefined}
            className={campoClase}
          />
          {errores.horaInicio && (
            <p id="limpieza-inicio-error" className="text-sm text-destructive">
              {errores.horaInicio}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="limpieza-fin" className={etiquetaClase}>
            Hora de fin
          </label>
          <input
            id="limpieza-fin"
            type="time"
            value={valores.horaFin}
            onChange={(e) => actualizar("horaFin", e.target.value)}
            aria-invalid={Boolean(errores.horaFin)}
            aria-describedby={errores.horaFin ? "limpieza-fin-error" : undefined}
            className={campoClase}
          />
          {errores.horaFin && (
            <p id="limpieza-fin-error" className="text-sm text-destructive">
              {errores.horaFin}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="limpieza-foto" className={etiquetaClase}>
          Foto de evidencia
        </label>
        <input
          ref={inputFotoRef}
          id="limpieza-foto"
          type="file"
          accept="image/*"
          onChange={(e) => cambiarFoto(e.target.files?.[0] ?? null)}
          aria-invalid={Boolean(errores.foto)}
          aria-describedby={errores.foto ? "limpieza-foto-error" : "limpieza-foto-ayuda"}
          className={`${campoClase} h-auto py-1.5 file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2.5 file:py-1 file:text-sm file:font-medium`}
        />
        {errores.foto ? (
          <p id="limpieza-foto-error" className="text-sm text-destructive">
            {errores.foto}
          </p>
        ) : (
          <p id="limpieza-foto-ayuda" className="text-sm text-muted-foreground">
            Imagen del local limpio, de hasta {TAMANO_MAXIMO_FOTO_MB} MB.
          </p>
        )}
        {vistaPrevia && (
          <img
            src={vistaPrevia}
            alt="Vista previa de la foto de evidencia"
            className="mt-1 max-h-60 w-full rounded-lg border object-contain sm:w-auto"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="limpieza-observaciones" className={etiquetaClase}>
          Observaciones <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <textarea
          id="limpieza-observaciones"
          rows={3}
          maxLength={LARGO_MAXIMO_OBSERVACIONES}
          value={valores.observaciones}
          onChange={(e) => actualizar("observaciones", e.target.value)}
          aria-invalid={Boolean(errores.observaciones)}
          className={`${campoClase} h-auto py-2`}
          placeholder="Ej.: faltaban fundas de basura."
        />
        {errores.observaciones && (
          <p className="text-sm text-destructive">{errores.observaciones}</p>
        )}
      </div>

      {errorEnvio && (
        <p role="alert" className="text-sm text-destructive">
          {errorEnvio}
        </p>
      )}
      {exito && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          Jornada registrada correctamente.
        </p>
      )}

      <Button type="submit" size="lg" disabled={enviando} className="self-start">
        {enviando ? "Registrando..." : "Registrar limpieza"}
      </Button>
    </form>
  );
}
