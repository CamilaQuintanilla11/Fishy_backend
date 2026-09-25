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

  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string): Promise<void> {
    return this.service.eliminar(id);
  }
}