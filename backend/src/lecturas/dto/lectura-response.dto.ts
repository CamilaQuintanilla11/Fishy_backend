export class LecturaResumenDto {
  id: string;
  titulo: string;
  orden: number;
  completada: boolean;
}

export class LecturaDetalleDto extends LecturaResumenDto {
  contenido: string;
}

export class ProgresoDto {
  completadas: number;
  total: number;
  porcentaje: number;
}