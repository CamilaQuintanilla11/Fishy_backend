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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reportes')
export class ReporteController{
  constructor(private readonly service: ReporteService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto:CreateReporteDto):Promise<ReporteResponseDto> {

    return this.service.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload):Promise<ReporteResponseDto[]>{
    return this.service.findAll(user.sub);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id:string): Promise<ReporteResponseDto> {
    return this.service.findOne(user.sub, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id:string, @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(user.sub, id,dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string):Promise<void> {
    return this.service.remove(user.sub, id);
  }
}