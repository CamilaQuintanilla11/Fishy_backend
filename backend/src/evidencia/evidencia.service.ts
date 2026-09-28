import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { EvidenciaRepository } from './evidencia.repository';
import { ReporteRepository } from '../reporte/reporte.repository';
import { EvidenciaResponseDto } from './dto/evidencia-response.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';
import { Evidencia } from './entities/evidencia.entity';
import { Reporte } from '../reporte/entities/reporte.entity';

@Injectable()
export class EvidenciaService {
  constructor(private readonly repository: EvidenciaRepository, private readonly reporteRepository: ReporteRepository) {}

  async crear(userID: string, dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    await this.getReporteDelUsuario(userID, dto.perteneceAReporte);
    const evidencia = await this.repository.save({
      url: dto.url,
      foto: '',
      descripcion: dto.descripcion,
      perteneceAReporte: dto.perteneceAReporte,
    });
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async listar(userID: string): Promise<EvidenciaResponseDto[]> {
    const evidencias = await this.repository.findAllByUsuario(userID);
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async obtener(userID: string, id: string): Promise<EvidenciaResponseDto> {
    const evidencia = await this.obtenerEvidenciaDelUsuario(userID, id);
    if (!evidencia) {
      throw new NotFoundException(`error`);
    }
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async findByReporte(userID: string, reporteId: string): Promise<EvidenciaResponseDto[]> {
    await this.getReporteDelUsuario(userID, reporteId);
    const evidencias = await this.repository.findByReporteId(reporteId);
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async actualizar(userID:string, id: string, dto: UpdateEvidenciaDto): Promise<EvidenciaResponseDto> {
        await this.obtenerEvidenciaDelUsuario(userID, id);
        const actualizado = await this.repository.update(id, dto);
        return EvidenciaResponseDto.fromEntity(actualizado!);
  }

  async setPhoto(userID: string, id:string, file: Express.Multer.File,): Promise<EvidenciaResponseDto> {
    const evidencia = await this.obtenerEvidenciaDelUsuario(userID, id);
    const anterior = evidencia.foto;

    const actualizado = (await this.repository.setPhoto(id, file.filename))!;

    await this.borrarArchivo(anterior)
    
    return EvidenciaResponseDto.fromEntity(actualizado);
  }

  async eliminar(userID: string, id: string): Promise<void> {
    await this.obtenerEvidenciaDelUsuario(userID, id);

    await this.repository.delete(id);
  }

  private async getReporteDelUsuario(userId: string, reporteId: string): Promise<Reporte> {
    const reporte = await this.reporteRepository.findById(reporteId);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${reporteId} no encontrado`);
    }
    if (reporte.perteneceA !== userId) {
      throw new ForbiddenException('No tienes acceso a este reporte');
    }
    return reporte;
  }

  private async obtenerEvidenciaDelUsuario(userId: string, id: string): Promise<Evidencia> {
    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`error`);
    }
    await this.getReporteDelUsuario(userId, evidencia.perteneceAReporte);
    return evidencia;
  }

  private async borrarArchivo(nombre: string): Promise<void> {
    if (!nombre) return;
    await unlink(join('uploads', nombre)).catch(() => undefined);
  }
}
