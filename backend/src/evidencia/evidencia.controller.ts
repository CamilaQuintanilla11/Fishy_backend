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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { extname } from 'node:path';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';
import { EvidenciaService } from './evidencia.service';
import { EvidenciaResponseDto } from './dto/evidencia-response.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';

const EXTENSIONES_PERMITIDAS = ['.png', '.jpg', '.jpeg', '.webp'];
const limitSize = 5 * 1024 * 1024; 

@ApiTags('evidencias')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('evidencias')
export class EvidenciaController {
  constructor(private readonly service: EvidenciaService) {}

  @Post()
  crear(@CurrentUser() user: JwtPayload, @Body() dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    return this.service.crear(user.sub, dto);
  }

  @Get()
  listar(@CurrentUser() user: JwtPayload): Promise<EvidenciaResponseDto[]> {
    return this.service.listar(user.sub);
  }

  @Get(':id')
  obtener(@Param('id') id: string): Promise<EvidenciaResponseDto> {
    return this.service.obtener(id);
  }

  @Patch(':id')
  actualizar(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateEvidenciaDto,
  ): Promise<EvidenciaResponseDto> {
    return this.service.actualizar(user.sub, id, dto);
  }

@Post(':id/photo')
@UseInterceptors(
  FileInterceptor('photo', {
    storage: diskStorage({
      destination: 'uploads',
      filename: (_req, file, cb) =>
        cb(null, randomUUID() + extname(file.originalname).toLowerCase()),
    }),
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!file.mimetype.startsWith('image/') || !EXTENSIONES_PERMITIDAS.includes(ext)) {
        return cb(new BadRequestException('Solo se permiten imagenes (png, jpg, jpeg, webp)'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: limitSize },
  }),
)
  @ApiOperation({ summary: 'Subir o reemplazar la foto de una evidencia' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { photo: { type: 'string', format: 'binary' } },
      required: ['photo'],
    },
  })
  @ApiResponse({ status: 201, type: EvidenciaResponseDto })
  @ApiResponse({ status: 400, description: 'No vino archivo, o no es una imagen valida' })
  @ApiResponse({ status: 403, description: 'La evidencia es de un reporte de otro usuario' })
  @ApiResponse({ status: 404, description: 'No existe una evidencia con ese id' })
  async uploadPhoto(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EvidenciaResponseDto> {
    if (!file) throw new BadRequestException('Falta el campo photo');
    try {
      return await this.service.setPhoto(user.sub, id, file);
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  eliminar(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    return this.service.eliminar(user.sub, id);
  }
}