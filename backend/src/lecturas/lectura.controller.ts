import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { LecturaService } from './lectura.service';
import { LecturaDetalleDto, ProgresoDto } from './dto/lectura-response.dto';
import { CreateLecturaDto, UpdateLecturaDto } from './dto/create-lectura.dto';

@ApiTags('lecturas')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Falta el token, es inválido o expiró' })
@UseGuards(AuthGuard)
@Controller('lecturas')
export class LecturaController {
  constructor(private readonly service: LecturaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar lecturas en orden, con tu progreso' })
  @ApiQuery({ name: 'modulo', required: false, type: Number, description: 'Solo las de ese módulo' })
  @ApiResponse({ status: 200, type: [LecturaDetalleDto] })
  listar(@CurrentUser() user: JwtPayload, @Query('modulo') modulo?: string): Promise<LecturaDetalleDto[]> {
    return this.service.listar(user.sub, parseModulo(modulo));
  }

  @Get('progreso')
  @ApiOperation({ summary: 'Tu progreso (total o de un módulo)' })
  @ApiQuery({ name: 'modulo', required: false, type: Number })
  @ApiResponse({ status: 200, type: ProgresoDto })
  progreso(@CurrentUser() user: JwtPayload, @Query('modulo') modulo?: string): Promise<ProgresoDto> {
    return this.service.progreso(user.sub, parseModulo(modulo));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una lectura' })
  @ApiResponse({ status: 200, type: LecturaDetalleDto })
  @ApiResponse({ status: 404, description: 'No existe' })
  obtener(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<LecturaDetalleDto> {
    return this.service.obtener(user.sub, id);
  }

  @Post(':id/completar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Marcar como leída' })
  @ApiResponse({ status: 200, type: LecturaDetalleDto })
  completar(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<LecturaDetalleDto> {
    return this.service.completar(user.sub, id);
  }

  @Delete(':id/completar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Quitar la marca de leída' })
  @ApiResponse({ status: 200, type: LecturaDetalleDto })
  desmarcar(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<LecturaDetalleDto> {
    return this.service.desmarcar(user.sub, id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear lectura (admin)' })
  @ApiResponse({ status: 201, type: LecturaDetalleDto })
  @ApiResponse({ status: 409, description: 'Ya hay una lectura con ese orden' })
  crear(@CurrentUser() user: JwtPayload, @Body() dto: CreateLecturaDto): Promise<LecturaDetalleDto> {
    return this.service.crear(user.sub, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Editar lectura (admin)' })
  @ApiResponse({ status: 200, type: LecturaDetalleDto })
  actualizar(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateLecturaDto,
  ): Promise<LecturaDetalleDto> {
    return this.service.actualizar(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Borrar lectura (admin)' })
  eliminar(@Param('id') id: string): Promise<void> {
    return this.service.eliminar(id);
  }
}

function parseModulo(valor?: string): number | undefined {
  if (valor === undefined || valor === '') return undefined;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < 1) {
    throw new BadRequestException('modulo debe ser un entero mayor a 0');
  }
  return numero;
}