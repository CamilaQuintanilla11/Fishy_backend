import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
}from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt';
import { ReporteService } from './reporte.service';
import { ReporteResponseDto } from './dto/reporte-response.dto';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';

@Controller('reportes')
@UseGuards(AuthGuard)
export class ReporteController{
  constructor(private readonly service: ReporteService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto:CreateReporteDto):Promise<ReporteResponseDto> {

    return this.service.create(user.sub, dto);
  }

  @Get()
  findAll():Promise<ReporteResponseDto[]>{
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id:string): Promise<ReporteResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id:string, @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(id,dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string):Promise<void> {
    return this.service.remove(id);
  }
}