import { RegistroLimpiezaForm } from "@/components/limpieza/RegistroLimpiezaForm";

// Módulo de Registro de Limpieza (issue #9).
export function CleaningPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Limpieza</h1>
        <p className="text-muted-foreground">
          Registra la jornada de limpieza que realizaste con su foto de evidencia.
        </p>
      </header>

      <section aria-labelledby="registro-limpieza" className="flex flex-col gap-4">
        <h2 id="registro-limpieza" className="text-lg font-semibold">
          Registrar jornada
        </h2>
        <RegistroLimpiezaForm />
      </section>
    </main>
  );
}
