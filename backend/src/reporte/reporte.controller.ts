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
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ModerarReporteDto } from './dto/admin-reporte.dto';

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
  findAll():Promise<ReporteResponseDto[]>{
    return this.service.findAll();
  }

  @Get('pendientes')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listarPendientes(): Promise<ReporteResponseDto[]> {
    return this.service.listarPendientes()
  }

  @Get(':id')
  findOne(@Param('id') id:string): Promise<ReporteResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id:string, @Body() dto: UpdateReporteDto,
  ): Promise<ReporteResponseDto> {
    return this.service.update(user.sub, id,dto);
  }


  @Patch(':id/moderar')
  @UseGuards(RolesGuard)
  @Roles('admin')
  moderar(@Param('id') id:string, @Body() dto: ModerarReporteDto): Promise<ReporteResponseDto> {
    return this.service.moderar(id,dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string):Promise<void> {
    return this.service.remove(user.sub, id);
  }
}