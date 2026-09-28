import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReporteRepository } from './reporte.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { EstadoRepository } from '../estado/estado.repository';
import { RiesgoRepository } from '../riesgo/riesgo.repository';
import { Reporte } from './entities/reporte.entity';

const ESTADO_INICIAL = 'pendiente';

@Injectable()
export class ReporteService {
  constructor(
    private readonly repository: ReporteRepository,
    private readonly estadoRepository: EstadoRepository,
    private readonly riesgoRepository: RiesgoRepository,
  ) {}

  async create(userId: string, dto: CreateReporteDto): Promise<ReporteResponseDto> {
    const estadoInicial = await this.estadoRepository.findByNombre(ESTADO_INICIAL);
    if (!estadoInicial) {
      throw new Error(`No existe el estado "${ESTADO_INICIAL}"`);
    }
    await this.validarRiesgo(dto.tieneRiesgo);

    const reporte = await this.repository.save({
      descripcion: dto.descripcion,
      tieneRiesgo: dto.tieneRiesgo,
      perteneceA: userId,
      tieneEstado: estadoInicial.id,
    });
    return ReporteResponseDto.fromEntity(reporte);
  }

  async findAll(userId: string): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAllByUsuario(userId);
    return reportes.map(ReporteResponseDto.fromEntity);
  }

  async findOne(userId: string, id: string): Promise<ReporteResponseDto> {
    const reporte = await this.obtenerReporteDelUsuario(userId, id);
    return ReporteResponseDto.fromEntity(reporte);
  }

  async update(userId: string, id: string, changes: UpdateReporteDto): Promise<ReporteResponseDto> {
    await this.obtenerReporteDelUsuario(userId, id);
    if (changes.tieneRiesgo) {
      await this.validarRiesgo(changes.tieneRiesgo);
    }
    const updated = (await this.repository.update(id, changes))!;
    return ReporteResponseDto.fromEntity(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.obtenerReporteDelUsuario(userId, id);
    await this.repository.delete(id);
  }

  private async obtenerReporteDelUsuario(userId: string, id: string): Promise<Reporte> {
    const reporte = await this.repository.findById(id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
    if (reporte.perteneceA !== userId) {
      throw new ForbiddenException('No tienes acceso a este reporte');
    }
    return reporte;
  }

  private async validarRiesgo(riesgoId: string): Promise<void> {
    const riesgo = await this.riesgoRepository.findById(riesgoId);
    if (!riesgo) {
      throw new NotFoundException('El riesgo no existe.');
    }
  }
}