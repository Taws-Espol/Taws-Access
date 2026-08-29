import { Button } from "@/components/ui/button";

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">SERGI</h1>
      <p className="text-muted-foreground">
        Sistema de Registro Biométrico y Gestión de Incidencias
      </p>
      <Button>Shadcn/ui configurado correctamente</Button>
    </div>
  );
}

export default App;
