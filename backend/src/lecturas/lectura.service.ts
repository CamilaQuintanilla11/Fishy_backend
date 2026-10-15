import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { LecturaRepository } from './lectura.repository';
import { LecturaDetalleDto, ProgresoDto } from './dto/lectura-response.dto';
import { CreateLecturaDto, UpdateLecturaDto } from './dto/create-lectura.dto';

/**
 * Reglas de negocio de las lecturas educativas.
 *
 * No sabe de HTTP ni de SQL: recibe DTOs ya validados, habla con el
 * repository y regresa `LecturaDetalleDto` o `ProgresoDto`. Los errores de
 * negocio se expresan como excepciones de Nest para que el controller no tenga
 * que traducirlas.
 *
 * Organización: cada lectura pertenece a un `modulo` (1, 2, …) y tiene un
 * `orden` global y único que define en qué posición se muestra. El contenido
 * se guarda en Markdown.
 *
 * Progreso: cada usuario marca lecturas como completadas; eso vive en
 * `progreso_lecturas` (llave primaria usuario + lectura), así que marcar dos
 * veces no duplica nada. Leer y marcar progreso: cualquier usuario con sesión.
 * Crear, editar y borrar lecturas: solo admin (el controller lo protege con
 * `@Roles('admin')`).
 */
@Injectable()
export class LecturaService {
  constructor(private readonly repository: LecturaRepository) {}

  /**
   * Lista lecturas en orden, con el progreso de quien pregunta.
   * @param userID - `sub` del token; se usa para calcular `completada`.
   * @param modulo - Si viene, solo las lecturas de ese módulo; si no, todas.
   * @returns Lecturas ordenadas por `orden`, con `contenido`, `completada` y
   *   `fecha_completado`. Si el módulo no tiene lecturas, regresa `[]`.
   */
  async listar(userID: string, modulo?: number): Promise<LecturaDetalleDto[]> {
    const lecturas = await this.repository.findAllConProgreso(userID, modulo);
    return lecturas.map((l) => LecturaDetalleDto.fromEntity(l));
  }

  /**
   * Busca una lectura por id, con el progreso de quien pregunta.
   * @param userID - `sub` del token.
   * @param id - UUID de la lectura.
   * @throws NotFoundException si no hay lectura con ese id.
   */
  async obtener(userID: string, id: string): Promise<LecturaDetalleDto> {
    const lectura = await this.repository.findByIdConProgreso(userID, id);
    if (!lectura) throw new NotFoundException(`Lectura ${id} no encontrada`);
    return LecturaDetalleDto.fromEntity(lectura);
  }

  /**
   * Cuántas lecturas lleva completadas el usuario.
   * @param userID - `sub` del token.
   * @param modulo - Si viene, cuenta solo las de ese módulo; si no, todas.
   * @returns `completadas`, `total` y `porcentaje` (entero de 0 a 100). Si no
   *   hay lecturas, el porcentaje es 0.
   */
  async progreso(userID: string, modulo?: number): Promise<ProgresoDto> {
    const { completadas, total } = await this.repository.progreso(userID, modulo);
    const dto = new ProgresoDto();
    dto.completadas = completadas;
    dto.total = total;
    dto.porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100);
    return dto;
  }

  /**
   * Marca una lectura como leída y guarda la fecha. Marcarla otra vez no
   * duplica el registro: solo actualiza `fecha_completado`.
   * @param userID - `sub` del token.
   * @param id - UUID de la lectura.
   * @returns La lectura con `completada: true`.
   * @throws NotFoundException si no hay lectura con ese id.
   */
  async completar(userID: string, id: string): Promise<LecturaDetalleDto> {
    await this.asegurarExiste(id);
    await this.repository.marcarCompletada(userID, id);
    return this.obtener(userID, id);
  }

  /**
   * Quita la marca de leída. Si el usuario no la había marcado, no pasa nada.
   * @param userID - `sub` del token.
   * @param id - UUID de la lectura.
   * @returns La lectura con `completada: false` y `fecha_completado: null`.
   * @throws NotFoundException si no hay lectura con ese id.
   */
  async desmarcar(userID: string, id: string): Promise<LecturaDetalleDto> {
    await this.asegurarExiste(id);
    await this.repository.desmarcar(userID, id);
    return this.obtener(userID, id);
  }

  /**
   * Crea una lectura. El controller la protege con `@Roles('admin')`.
   * @param userID - `sub` del token; solo se usa para armar la respuesta.
   * @param dto - Título, contenido en Markdown, módulo y, opcionalmente, orden.
   *   Si no viene `orden`, se coloca al final (el mayor actual + 1).
   * @returns La lectura creada, con `completada: false`.
   * @throws ConflictException si ya hay una lectura con ese `orden`.
   */
  async crear(userID: string, dto: CreateLecturaDto): Promise<LecturaDetalleDto> {
    const orden = dto.orden ?? (await this.repository.siguienteOrden());
    await this.asegurarOrdenLibre(orden);
    const lectura = await this.repository.save({
      titulo: dto.titulo,
      contenido: dto.contenido,
      modulo: dto.modulo,
      orden,
    });
    return this.obtener(userID, lectura.id);
  }

  /**
   * Edita una lectura. Solo cambia los campos que vienen; lo demás se
   * conserva. El controller la protege con `@Roles('admin')`.
   * @param userID - `sub` del token; solo se usa para armar la respuesta.
   * @param id - UUID de la lectura.
   * @param dto - Cualquier combinación de `titulo`, `contenido`, `modulo` y `orden`.
   * @returns La lectura actualizada.
   * @throws NotFoundException si no hay lectura con ese id.
   * @throws ConflictException si el nuevo `orden` ya lo usa otra lectura.
   */
  async actualizar(userID: string, id: string, dto: UpdateLecturaDto): Promise<LecturaDetalleDto> {
    await this.asegurarExiste(id);
    if (dto.orden !== undefined) await this.asegurarOrdenLibre(dto.orden, id);
    await this.repository.update(id, dto);
    return this.obtener(userID, id);
  }

  /**
   * Borra una lectura. Es definitivo: no hay papelera. La BD borra en cascada
   * el progreso que los usuarios tenían en ella. El controller la protege con
   * `@Roles('admin')`.
   * @param id - UUID de la lectura.
   * @throws NotFoundException si no hay lectura con ese id.
   */
  async eliminar(id: string): Promise<void> {
    await this.asegurarExiste(id);
    await this.repository.delete(id);
  }

  /** @throws NotFoundException si no hay lectura con ese id. */
  private async asegurarExiste(id: string): Promise<void> {
    if (!(await this.repository.findById(id))) {
      throw new NotFoundException(`Lectura ${id} no encontrada`);
    }
  }

  /**
   * `orden` es único en la BD; esto da un 409 claro en lugar de un error de MySQL.
   * @param exceptoId - Al editar, la propia lectura no cuenta como conflicto.
   * @throws ConflictException si otra lectura ya usa ese `orden`.
   */
  private async asegurarOrdenLibre(orden: number, exceptoId?: string): Promise<void> {
    const ocupada = await this.repository.findByOrden(orden);
    if (ocupada && ocupada.id !== exceptoId) {
      throw new ConflictException(`Ya existe una lectura con orden ${orden}`);
    }
  }
}