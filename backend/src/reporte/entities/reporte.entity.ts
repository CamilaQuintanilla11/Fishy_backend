export class Reporte {
  id: string;

  fecha_pub: Date;
  fecha_update: Date;
  fecha_aprob?: Date;

  perteneceA: string;
  tieneEstado: string;
  tieneRiesgo: string | null;
}
