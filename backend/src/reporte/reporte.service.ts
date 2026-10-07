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
import { ReporteLikeRepository } from './reporte-like.repository';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { Inject, forwardRef } from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { EvidenciaRepository } from '../evidencia/evidencia.repository';
import { EvidenciaResponseDto } from 'src/evidencia/dto/evidencia-response.dto';

const ESTADO_INICIAL = 'pendiente';

@Injectable()
export class ReporteService {
  constructor(
    private readonly repository: ReporteRepository,
    private readonly estadoRepository: EstadoRepository,
    private readonly riesgoRepository: RiesgoRepository,
    private readonly categoriaRepository: CategoriaRepository,
    private readonly reporteCategoriaRepository: ReporteCategoriaRepository,
    private readonly likeRepository: ReporteLikeRepository,
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(forwardRef(() => EvidenciaRepository))
    private readonly evidenciaRepository: EvidenciaRepository,
  ) {}

  async create(userID: string, dto: CreateReporteDto): Promise<ReporteResponseDto> {
    try {
      this.checkReporte(dto);
    } catch (e) {}

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
      titulo: dto.titulo,
      perteneceA: userID,
      tieneEstado: estadoInicial.id,
    });
    await this.reporteCategoriaRepository.agregarVarias(reporte.id, dto.categorias);
    const response = ReporteResponseDto.fromEntity(reporte, { incluirDueno: false });
    response.categorias = dto.categorias;

    return response;
  }


async findAll(rolNombre: string): Promise<ReporteResponseDto[]> {
  let reportes: Reporte[];

  if (rolNombre === 'admin') {
    reportes = await this.repository.findAll();
  } else {
    const aprobado = await this.estadoRepository.findByNombre('aprobado');

    if (!aprobado) {
      throw new Error('No existe el estado "aprobado"');
    }

    reportes = await this.repository.findAllByEstado(aprobado.id);
  }

  return Promise.all(
    reportes.map(async (reporte) => {
      const dto = ReporteResponseDto.fromEntity(reporte, {
        incluirDueno: rolNombre === 'admin',
      });

      dto.categorias =
        await this.reporteCategoriaRepository.findCategorias(reporte.id);

      const evidencias =
        await this.evidenciaRepository.findByReporteId(reporte.id);

      dto.evidencias =
        evidencias.map(EvidenciaResponseDto.fromEntity);

      return dto;
    }),
  );
}

  async findOne(userID: string, rolNombre: string, id: string): Promise<ReporteResponseDto> {
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
    const dto = ReporteResponseDto.fromEntity(reporte, { incluirDueno: esAdmin, });
    dto.categorias = await this.reporteCategoriaRepository.findCategorias(id);
    const evidencias = await this.evidenciaRepository.findByReporteId(id);
    dto.evidencias = evidencias.map(EvidenciaResponseDto.fromEntity);
    return dto;
  }

  async update(userID: string, id: string, changes: UpdateReporteDto): Promise<ReporteResponseDto> {
    await this.obtenerReportePropio(userID, id);
    if (changes.categorias) {
      for (const categoriaId of changes.categorias) {
        const categoria = await this.categoriaRepository.findById(categoriaId);
        if (!categoria) {
          throw new NotFoundException(`La categoría no existe`);
        }
      }
      await this.reporteCategoriaRepository.eliminarTodas(id);
      await this.reporteCategoriaRepository.agregarVarias(id, changes.categorias);
    }
    if (changes.titulo) {
      await this.repository.update(id, { titulo: changes.titulo });
    }
    const updated = (await this.repository.findById(id))!;
    const response = ReporteResponseDto.fromEntity(updated, { incluirDueno: false });
    if (changes.categorias) {
      response.categorias = changes.categorias;
    } else {
      response.categorias = await this.reporteCategoriaRepository.findCategorias(id);
    }
    return response;
  }

  async remove(userID: string, id: string): Promise<void> {
    await this.obtenerReportePropio(userID, id);
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

    const respuestas = await Promise.all(reportes.map(async (r) => {
      const dto = ReporteResponseDto.fromEntity(r, { incluirDueno: true });
      dto.categorias = await this.reporteCategoriaRepository.findCategorias(r.id);
      return dto;
    }));

    return respuestas;
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
      cambios.fecha_aprob = new Date(); 
    }

    const updated = (await this.repository.update(id, cambios))!;
    return ReporteResponseDto.fromEntity(updated, { incluirDueno: true });
  }

  async darLike(userID: string, id: string): Promise<{ mePasoIgualCount: number; yaDiLike: boolean }> {
    await this.obtenerReporte(id); 
    await this.likeRepository.agregar(userID, id);
    return {
      mePasoIgualCount: await this.likeRepository.contar(id),
      yaDiLike: true,
    };
  }
 
  async quitarLike(userID: string, id: string): Promise<{ mePasoIgualCount: number; yaDiLike: boolean }> {
    await this.obtenerReporte(id);
    await this.likeRepository.eliminar(userID, id);
    return {
      mePasoIgualCount: await this.likeRepository.contar(id),
      yaDiLike: false,
    };
  }
 
  private async completarDto(
    reporte: Reporte,
    incluirDueno: boolean,
    userID?: string,
  ): Promise<ReporteResponseDto> {
    const dto = ReporteResponseDto.fromEntity(reporte, { incluirDueno });
 
    dto.categorias = await this.reporteCategoriaRepository.findCategorias(reporte.id);
 
    const evidencias = await this.evidenciaRepository.findByReporteId(reporte.id);
    dto.evidencias = evidencias.map((e) => EvidenciaResponseDto.fromEntity(e));
 
    const autor = await this.usuarioRepository.findById(reporte.perteneceA);
    dto.autor = autor?.nombre ?? 'Anónimo';
 
    dto.mePasoIgualCount = await this.likeRepository.contar(reporte.id);
    dto.yaDiLike = userID ? await this.likeRepository.existe(userID, reporte.id) : false;
 
    return dto;
  }

  private checkReporte(data: any): boolean {
    if (data) {
      if (data.categorias) {
        if (Array.isArray(data.categorias)) {
          if (data.categorias.length > 0) {
            return true;
          } else {
            throw new Error('sin categorias');
          }
        } else {
          throw new Error('categorias no es arreglo');
        }
      } else {
        throw new Error('sin categorias');
      }
    } else {
      throw new Error('sin datos');
    }
  }

  private async obtenerReporte(id: string): Promise<Reporte> {
    const reporte = await this.repository.findById(id);
    if (!reporte) {
      throw new NotFoundException(`Reporte ${id} no encontrado`);
    }
    return reporte;
  }

  private async obtenerReportePropio(userID: string, id: string): Promise<Reporte> {
    const reporte = await this.obtenerReporte(id);
    if (reporte.perteneceA !== userID) {
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