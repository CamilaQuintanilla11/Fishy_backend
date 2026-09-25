import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
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