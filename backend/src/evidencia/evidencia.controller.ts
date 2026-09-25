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

@Controller('evidencias')
export class EvidenciaController {
  constructor(private readonly service: EvidenciaService) {}

  @Post()
  create(@Body() dto: CreateEvidenciaDto): Promise<EvidenciaResponseDto> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<EvidenciaResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EvidenciaResponseDto> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}