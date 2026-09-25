import { ApiProperty } from '@nestjs/swagger';
import { Evidencia } from '../entities/evidencia.entity';

export class EvidenciaResponseDto {
  id: string;
  url: string;
  foto: string;
  fecha_creado: string;
  perteneceAReporte: string;
  @ApiProperty({
    type: String,
    example: '/uploads/ana.png',
    nullable: true,
    description: 'Ruta de la foto, relativa al servidor; null si no tiene',
  })

  static fromEntity(evidencia: Evidencia): EvidenciaResponseDto {
    const dto = new EvidenciaResponseDto();
    dto.id = evidencia.id;
    dto.url = evidencia.url;
    dto.foto = '/uploads/' + evidencia.foto;
    dto.fecha_creado = evidencia.fecha_creado.toISOString();
    dto.perteneceAReporte = evidencia.perteneceAReporte;
    return dto;
  }
}