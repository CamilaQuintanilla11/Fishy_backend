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
import { EvidenciaService } from './evidencia.service';
import { EvidenciaResponseDto } from './dto/evidencia-response.dto';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { UpdateEvidenciaDto } from './dto/update-evidencia.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('evidencias')
export class EvidenciaController {
  constructor(private readonly service: EvidenciaService) {}

  @Post()
  crear(@Body() dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    return this.service.crear(dto);
  }

  @Get()
  listar(): Promise<EvidenciaResponseDto[]> {
    return this.service.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string): Promise<EvidenciaResponseDto> {
    return this.service.obtener(id);
  }
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateEvidenciaDto) {
    return this.service.actualizar(id, dto);
  }

  @Post(':id/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => cb(null, file.originalname),
      }),
    }),
  )
  @ApiOperation({ summary: 'Subir o reemplazar la foto de un contacto' })
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
  @ApiResponse({ status: 404, description: 'No existe un contacto con ese id' })
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EvidenciaResponseDto> {
    if (!file) throw new BadRequestException('Falta el campo photo');
    return (this.service as any).setPhoto(id, file);
  }
  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string): Promise<void> {
    return this.service.eliminar(id);
  }
}