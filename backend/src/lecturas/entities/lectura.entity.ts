export class Lectura {
  id: string;
  titulo: string;
  contenido: string;
  orden: number;
  modulo: number;
}

export type LecturaConProgreso = Lectura & {
  completada: boolean;
  fecha_completado: Date | null;
};