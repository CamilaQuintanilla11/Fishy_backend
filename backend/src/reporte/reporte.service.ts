import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReporteRepository } from './reporte.repository';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { EstadoRepository } from '../estado/estado.repository';
import { RiesgoRepository } from '../riesgo/riesgo.repository';
import { Reporte } from './entities/reporte.entity';
import { ModerarReporteDto } from './dto/admin-reporte.dto';
import { CategoriaRepository } from '../categoria/categoria.repository';
import { ReporteCategoriaRepository } from './reporte-categoria.repository';

const ESTADO_INICIAL = 'pendiente';

@Injectable()
export class ReporteService {
  constructor(
    private readonly repository: ReporteRepository,
    private readonly estadoRepository: EstadoRepository,
    private readonly riesgoRepository: RiesgoRepository,
    private readonly categoriaRepository: CategoriaRepository,
    private readonly reporteCategoriaRepository: ReporteCategoriaRepository,
  ) {}

  async create(userId: string, dto: CreateReporteDto): Promise<ReporteResponseDto> {
    const estadoInicial = await this.estadoRepository.findByNombre(ESTADO_INICIAL);
    if (!estadoInicial) {
      throw new Error(`No existe el estado "${ESTADO_INICIAL}"`);
    }
    for (const categoriaId of dto.categorias) {
      const categoria = await this.categoriaRepository.findById(categoriaId);

      if (!categoria){
        throw new NotFoundException('la categoría no existe');
      }
    }

    const reporte = await this.repository.save({
      perteneceA: userId,
      tieneEstado: estadoInicial.id,
    });
    await this.reporteCategoriaRepository.agregarVarias(reporte.id, dto.categorias);

    return ReporteResponseDto.fromEntity(reporte);
  }


  async findAll(): Promise<ReporteResponseDto[]> {
    const reportes = await this.repository.findAll();
    return reportes.map(ReporteResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<ReporteResponseDto> {
    const dto = ReporteResponseDto.fromEntity(reporte);
    dto.categorias = await this.reporteCategoriaRepository.findCategorias(id);
    return dto;
  }

  async update(userId: string, id: string, changes: UpdateReporteDto): Promise<ReporteResponseDto> {
    await this.obtenerReportePropio(userId, id);
    if (changes.categorias) {
      await this.reporteCategoriaRepository.eliminarTodas(id);
      await this.reporteCategoriaRepository.agregarVarias(id, changes.categorias);
    }
    const updated = (await this.repository.findById(id))!;
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
    await this.obtenerReporte(id); 
    const estado = await this.estadoRepository.findById(dto.tieneEstado);
    if (!estado) {
      throw new NotFoundException('El estado no existe.');
    }
    const riesgo = await this.riesgoRepository.findById(dto.tieneRiesgo);
    if (!riesgo) {
      throw new NotFoundException('El riesgo no existe.');
    }
    const updated = (await this.repository.update(id, {
      tieneEstado: dto.tieneEstado,
      tieneRiesgo: dto.tieneRiesgo,
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