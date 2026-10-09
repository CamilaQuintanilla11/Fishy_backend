import { ApiProperty } from '@nestjs/swagger';
import { Evidencia } from '../entities/evidencia.entity';

export class EvidenciaResponseDto {
  @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
  id: string;

  @ApiProperty({ example: 'http://banco-seguro-mx.example/login' })
  url: string;

  @ApiProperty({
    type: String,
    example: '/uploads/ana.png',
    description: "Ruta de la foto, relativa al servidor; si aún no tiene foto viene solo '/uploads/'",
  })
  foto: string;

  @ApiProperty({ example: '2026-10-09T15:00:00.000Z', description: 'ISO 8601' })
  fecha_creado: string;

  @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
  perteneceAReporte: string;

  @ApiProperty({ example: 'Me llegó por SMS diciendo que mi cuenta estaba bloqueada' })
  descripcion:string;

  static fromEntity(evidencia: Evidencia): EvidenciaResponseDto {
    const dto = new EvidenciaResponseDto();
    dto.id = evidencia.id;
    dto.url = evidencia.url;
    dto.foto = '/uploads/' + evidencia.foto;
    dto.fecha_creado = evidencia.fecha_creado.toISOString();
    dto.perteneceAReporte = evidencia.perteneceAReporte;
    dto.descripcion=evidencia.descripcion;
    return dto;
  }
}