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

const EXTENSIONES = ['.png', '.jpg', '.jpeg', '.webp'];

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
  obtener(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<EvidenciaResponseDto> {
    return this.service.obtener(user.sub, id);
  }
  @Patch(':id')
  actualizar(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateEvidenciaDto) {
    return this.service.actualizar(user.sub, id, dto);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => cb(null, randomUUID() + extname(file.originalname).toLowerCase()),
      }),
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !EXTENSIONES.includes(ext)) {
          return cb(new BadRequestException('Solo se permiten imagenes (png, jpg, jpeg, webp)'), false);
      }
      cb(null, true);
    },
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
  @ApiResponse({ status: 400, description: 'No vino ningún archivo' })
  @ApiResponse({ status: 404, description: 'No existe una evidencia con ese id' })
  async uploadPhoto(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EvidenciaResponseDto> {
    if (!file) throw new BadRequestException('Falta el campo photo');
    return (this.service as any).setPhoto(id, file);
  }
  @Delete(':id')
  @HttpCode(204)
  eliminar(@CurrentUser() user: JwtPayload, @Param('id') id: string): Promise<void> {
    return this.service.eliminar(user.sub, id);
  }
}