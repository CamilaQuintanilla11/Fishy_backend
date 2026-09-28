import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReporteRepository } from './reporte.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { EstadoRepository } from '../estado/estado.repository';
import { RiesgoRepository } from '../riesgo/riesgo.repository';
import { Reporte } from './entities/reporte.entity';
import { ModerarReporteDto } from './dto/admin-reporte.dto';


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


  async findAll(): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAll();
    return reportes.map(ReporteResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<ReporteResponseDto> {
    const reporte = await this.obtenerReporte(id);
    return ReporteResponseDto.fromEntity(reporte);
  }

  async update(userId: string, id: string, changes: UpdateReporteDto): Promise<ReporteResponseDto> {
    await this.obtenerReportePropio(userId, id);
    if (changes.tieneRiesgo) {
      await this.validarRiesgo(changes.tieneRiesgo);
    }
    const updated = (await this.repository.update(id, changes))!;
    return ReporteResponseDto.fromEntity(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.obtenerReportePropio(userId, id);
    await this.repository.delete(id);
  }

  async listarPendientes(): Promise<ReporteResponseDto[]> {
    const pendiente = await this.estadoRepository.findByNombre(ESTADO_INICIAL);
    if (!pendiente) {
      throw new Error(`No existe el estado "${ESTADO_INICIAL}"`);
    }
    const reportes = await this.repository.findAllByEstado(pendiente.id);
    return reportes.map(ReporteResponseDto.fromEntity);
  }

  async moderar(id: string, dto: ModerarReporteDto): Promise<ReporteResponseDto> {
    await this.obtenerReporte(id); // 404 si no existe (sin chequeo de dueno: es admin)
    const estado = await this.estadoRepository.findById(dto.tieneEstado);
    if (!estado) {
      throw new NotFoundException('El estado no existe.');
    }
    const updated = (await this.repository.update(id, {
      tieneEstado: dto.tieneEstado,
      fecha_aprob: new Date(),
    }))!;
    return ReporteResponseDto.fromEntity(updated);
  }

  private async obtenerReporte(id: string): Promise<Reporte> {
    const reporte = await this.repository.findById(id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
    return reporte;
  }

  private async obtenerReportePropio(userId: string, id: string): Promise<Reporte> {
    const reporte = await this.obtenerReporte(id);
    if (reporte.perteneceA !== userId) {
      throw new ForbiddenException('No puedes modificar un reporte que no es tuyo');
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