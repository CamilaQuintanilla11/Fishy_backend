import { EvidenciaResponseDto } from 'src/evidencia/dto/evidencia-response.dto';
import { Reporte } from '../entities/reporte.entity';
 
export class ReporteResponseDto {
  id: string;
  titulo: string;
  tieneRiesgo: string | null;
  fecha_pub: string;
  fecha_update: string;
  fecha_aprob: string | null;
  perteneceA: string;
  tieneEstado: string;
  categorias: string[] = [];
  evidencias: EvidenciaResponseDto[] = [];
  autor: string = 'Anónimo';
  mePasoIgualCount: number = 0;
  yaDiLike: boolean = false;
 
  static fromEntity(reporte: Reporte, opts: { incluirDueno: boolean }): ReporteResponseDto {
    const dto = new ReporteResponseDto();
    dto.id = reporte.id;
    dto.titulo = reporte.titulo;
    dto.tieneRiesgo = reporte.tieneRiesgo;
    dto.fecha_pub = reporte.fecha_pub.toISOString();
    dto.fecha_update = reporte.fecha_update.toISOString();
    dto.fecha_aprob = reporte.fecha_aprob ? reporte.fecha_aprob.toISOString() : null;
    if (opts.incluirDueno) {
      dto.perteneceA = reporte.perteneceA;
    }
    dto.tieneEstado = reporte.tieneEstado;
    return dto;
  }
}