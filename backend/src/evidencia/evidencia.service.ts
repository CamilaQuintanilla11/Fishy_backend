import { Injectable, NotFoundException } from '@nestjs/common';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaResponseDto } from './dto/evidencia-response.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';

@Injectable()
export class EvidenciaService {
  constructor(private readonly repository: EvidenciaRepository) {}

  async crear(dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    const evidencia = await this.repository.save({
      url: dto.url,
      foto: dto.foto,
      perteneceAReporte: dto.perteneceAReporte,
    });
    return EvidenciaResponseDto.fromEntity(evidencia);
  }

  async listar(): Promise<EvidenciaResponseDto[]> {
    const evidencias = await this.repository.findAll();
    return evidencias.map(EvidenciaResponseDto.fromEntity);
  }

  async obtener(id: string): Promise<EvidenciaResponseDto> {
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

  async actualizar(id: string, dto: UpdateEvidenciaDto): Promise<EvidenciaResponseDto> {
        await this.obtener(id);

        const cambios: Record<string, any> = {...dto};
        const actualizado = await this.repository.update(id, cambios);
        return EvidenciaResponseDto.fromEntity(actualizado!);
  }

  async eliminar(id: string): Promise<void> {
    const evidencia = await this.repository.findById(id);
    if (!evidencia) {
      throw new NotFoundException(`Evidencia ${id} no encontrada`);
    }
    await this.repository.delete(id);
  }
}