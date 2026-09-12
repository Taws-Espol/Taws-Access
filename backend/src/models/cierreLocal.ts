export interface CierreLocal {
  id: number;
  fecha_cierre: string;
  evento_acceso_id: number | null;
  evidencia_url: string | null;
}

// Cierre con sus responsables (handoff a RF-INC-02).
export interface CierreLocalConResponsables extends CierreLocal {
  responsables: Array<{
    miembro_id: number;
    nombre: string;
    apellido: string;
  }>;
}
