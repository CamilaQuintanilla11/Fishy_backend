import { ApiProperty } from '@nestjs/swagger';
import { LecturaConProgreso } from '../entities/lectura.entity';

export class LecturaResumenDto {
  @ApiProperty({ format: 'uuid', example: 'd0000000-0000-0000-0000-000000000001' })
  id: string;

  @ApiProperty({ example: '¿Qué es el phishing?' })
  titulo: string;

  @ApiProperty({ example: 1, description: 'Posición global de la lectura (única)' })
  orden: number;

  @ApiProperty({ example: 1, description: 'Módulo al que pertenece' })
  modulo: number;

  @ApiProperty({ example: false, description: 'Si quien pregunta ya la completó' })
  completada: boolean;

  @ApiProperty({ type: String, nullable: true, example: null, description: 'ISO 8601; null si no la ha completado' })
  fecha_completado: string | null;
}

export class LecturaDetalleDto extends LecturaResumenDto {
  @ApiProperty({ example: '## Señales de alerta\n- Urgencia\n- Te piden datos', description: 'Contenido en Markdown' })
  contenido: string;

  static fromEntity(lectura: LecturaConProgreso): LecturaDetalleDto {
    const dto = new LecturaDetalleDto();
    dto.id = lectura.id;
    dto.titulo = lectura.titulo;
    dto.contenido = lectura.contenido;
    dto.orden = lectura.orden;
    dto.modulo = lectura.modulo;
    dto.completada = lectura.completada;
    dto.fecha_completado = lectura.fecha_completado ? lectura.fecha_completado.toISOString() : null;
    return dto;
  }
}

export class ProgresoDto {
  @ApiProperty({ example: 3 })
  completadas: number;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 30, description: 'Entero de 0 a 100' })
  porcentaje: number;
}