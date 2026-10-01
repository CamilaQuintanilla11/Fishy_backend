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
import { EstadoRepository } from 'src/estado/estado.repository';

@Injectable()
export class EvidenciaService {
  constructor(
    private readonly repository: EvidenciaRepository,
    private readonly reporteRepository: ReporteRepository,
    private readonly estadoRepository: EstadoRepository,
  ) {}


  async crear(userId: string, dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    await this.getReportePropio(userId, dto.perteneceAReporte);
    const evidencia = await this.repository.save({
      url: dto.url,
      foto: '', 
      descripcion: dto.descripcion,
      perteneceAReporte: dto.perteneceAReporte,
    });
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async listar(rolNombre: string): Promise<EvidenciaResponseDto[]> {
    if (rolNombre === 'admin') {
      return (await this.repository.findAll()).map(EvidenciaResponseDto.fromEntity);
    }
    const aprobado = await this.estadoRepository.findByNombre('aprobado');
    if (!aprobado) throw new Error('No existe el estado "aprobado"');
    return (await this.repository.findAllAprobadas(aprobado.id)).map(EvidenciaResponseDto.fromEntity);
  }

  async obtener(id: string): Promise<EvidenciaResponseDto> {
    const evidencia = await this.getEvidencia(id);
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async findByReporte(reporteId: string): Promise<EvidenciaResponseDto[]> {
    const reporte = await this.reporteRepository.findById(reporteId);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${reporteId} no encontrado`);
    }
    const evidencias = await this.repository.findByReporteId(reporteId);
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async actualizar(userId: string, id: string, dto: UpdateEvidenciaDto): Promise<EvidenciaResponseDto> {
    await this.getEvidenciaPropia(userId, id);
    const actualizado = await this.repository.update(id, dto);
    return EvidenciaResponseDto.fromEntity(actualizado!);
  }

  async setPhoto(userId: string, id: string, file: Express.Multer.File): Promise<EvidenciaResponseDto> {
    const anterior = await this.getEvidenciaPropia(userId, id);
    const actualizado = (await this.repository.setPhoto(id, file.filename))!;
    await this.borrarArchivo(anterior.foto);
    return EvidenciaResponseDto.fromEntity(actualizado);
  }

  async eliminar(userId: string, id: string): Promise<void> {
    const evidencia = await this.getEvidenciaPropia(userId, id);
    await this.repository.delete(id);
    await this.borrarArchivo(evidencia.foto);
  }


  private async getReportePropio(userId: string, reporteId: string): Promise<Reporte> {
    const reporte = await this.reporteRepository.findById(reporteId);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${reporteId} no encontrado`);
    }
    if (reporte.perteneceA !== userId) {
      throw new ForbiddenException('No tienes acceso a este reporte');
    }
    return reporte;
  }

  private async getEvidencia(id: string): Promise<Evidencia> {
    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} no encontrada`);
    }
    return evidencia;
  }

  private async getEvidenciaPropia(userId: string, id: string): Promise<Evidencia> {
    const evidencia = await this.getEvidencia(id);
    await this.getReportePropio(userId, evidencia.perteneceAReporte);
    return evidencia;
  }

  private async borrarArchivo(nombre: string): Promise<void> {
    if (!nombre) return;
    await unlink(join('uploads', nombre)).catch(() => undefined);
  }
}