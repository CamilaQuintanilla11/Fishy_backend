import { Injectable, NotFoundException } from '@nestjs/common';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaResponseDto } from './dto/evidencia-response.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';

@Injectable()
export class EvidenciaService {
  constructor(private readonly repository: EvidenciaRepository) {}

  async create(dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    const evidencia = await this.repository.save({
      url: dto.url,
      foto: dto.foto,
      perteneceAReporte: dto.perteneceAReporte,
    });
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async findAll(): Promise<EvidenciaResponseDto[]> {
    const evidencias = await this.repository.findAll();
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<EvidenciaResponseDto> {
    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} no encontrada`);
    }
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async findByReporte(reporteId: string): Promise<EvidenciaResponseDto[]> {
    const evidencias = await this.repository.findByReporteId(reporteId);
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async remove(id: string): Promise<void> {
    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} no encontrada`);
    }
    await this.repository.delete(id);
  }
}