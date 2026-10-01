import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { Inject, forwardRef } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { EvidenciaRepository } from '../evidencia/evidencia.repository';

const ESTADO_INICIAL = 'pendiente';

@Injectable()
export class ReporteService {
  constructor(
    private readonly repository: ReporteRepository,
    private readonly estadoRepository: EstadoRepository,
    private readonly riesgoRepository: RiesgoRepository,
    private readonly categoriaRepository: CategoriaRepository,
    private readonly reporteCategoriaRepository: ReporteCategoriaRepository,
    @Inject(forwardRef(() => EvidenciaRepository))
    private readonly evidenciaRepository: EvidenciaRepository,
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

    return ReporteResponseDto.fromEntity(reporte, { incluirDueno: false });
  }


  async findAll(rolNombre: string): Promise<ReporteResponseDto[]> {
    if (rolNombre === 'admin') {
    const todos = await this.repository.findAll();
    return todos.map((r) => ReporteResponseDto.fromEntity(r, { incluirDueno: true }));
  }
  const aprobado = await this.estadoRepository.findByNombre('aprobado');
  if (!aprobado) {
    throw new Error('No existe el estado "aprobado"');
  }
  const reportes = await this.repository.findAllByEstado(aprobado.id);
  return reportes.map((r) => ReporteResponseDto.fromEntity(r, { incluirDueno: false }));
}

  async findOne(userID: string, id: string, rolNombre: string): Promise<ReporteResponseDto> {
    const reporte = await this.obtenerReporte(id);
    const esAdmin = rolNombre === 'admin';
    const esDueno = reporte.perteneceA === userID;
    if (!esAdmin && !esDueno) {
      const aprobado = await this.estadoRepository.findByNombre('aprobado');
      if (!aprobado) {
        throw new Error('No existe el estado "aprobado"');
      }
      if (reporte.tieneEstado !== aprobado.id) {
        throw new ForbiddenException('No puedes ver un reporte que no es tuyo y que no está aprobado');
      }
    }
    const dto = ReporteResponseDto.fromEntity(reporte, { incluirDueno: false });
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
    return ReporteResponseDto.fromEntity(updated, { incluirDueno: false });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.obtenerReportePropio(userId, id);
    const evidencias = await this.evidenciaRepository.findByReporteId(id);
    await this.repository.delete(id);
    await Promise.all(evidencias.filter((e) => e.foto).map((e) => unlink(join('uploads', e.foto)).catch(() => undefined)));
  }

  async listarPendientes(): Promise<ReporteResponseDto[]> {
    const pendiente = await this.estadoRepository.findByNombre(ESTADO_INICIAL);
    if (!pendiente) {
      throw new Error(`No existe el estado "${ESTADO_INICIAL}"`);
    }
    const reportes = await this.repository.findAllByEstado(pendiente.id);
    return reportes.map((r) => ReporteResponseDto.fromEntity(r, { incluirDueno: false }));
  }

async moderar(id: string, dto: ModerarReporteDto): Promise<ReporteResponseDto> {
  const reporte = await this.obtenerReporte(id);

  const pendiente = await this.estadoRepository.findByNombre('pendiente');
  if (reporte.tieneEstado !== pendiente?.id) {
    throw new BadRequestException('Este reporte ya fue moderado');
  }

  const nuevoEstado = await this.estadoRepository.findById(dto.tieneEstado);
  if (!nuevoEstado) throw new NotFoundException('El estado no existe.');

  const cambios: Partial<Reporte> = { tieneEstado: dto.tieneEstado };
  if (nuevoEstado.nombre === 'aprobado') {
    cambios.fecha_aprob = new Date(); // solo se llena si SI se aprueba
  }

  const updated = (await this.repository.update(id, cambios))!;
  return ReporteResponseDto.fromEntity(updated, { incluirDueno: true });
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
    const pendiente = await this.estadoRepository.findByNombre('pendiente');
    if (reporte.tieneEstado !== pendiente?.id) {
      throw new BadRequestException('No puedes modificar un reporte que ya fue moderado');
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