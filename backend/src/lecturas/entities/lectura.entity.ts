export class Lectura {
  id: string;
  titulo: string;
  contenido: string;
  orden: number;
}

export type LecturaConProgreso = Lectura & { completada: boolean };
export type LecturaResumen = Omit<LecturaConProgreso, 'contenido'>;