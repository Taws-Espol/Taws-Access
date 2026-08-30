import { Button } from "@/components/ui/button";

export function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <p className="text-muted-foreground">Pantalla placeholder — issue de autenticación (#6).</p>
      <Button disabled>Ingresar</Button>
    </div>
  );
}
