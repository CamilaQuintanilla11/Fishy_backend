import {
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

import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('foto'))
  create(@CurrentUser() user: JwtPayload, @Body() dto:CreateReporteDto, @UploadedFile() foto: Express.Multer.File):Promise<ReporteResponseDto> {

    return this.service.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<ReporteResponseDto[]> {
    return this.service.findAll(user.sub, user.rolNombre);
  }

  @Get('pendientes')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listarPendientes(): Promise<ReporteResponseDto[]> {
    return this.service.listarPendientes()
  }

  @Get(':id')
  findOne(@Param('id') id:string, @CurrentUser() user: JwtPayload): Promise<ReporteResponseDto> {
    return this.service.findOne(user.sub, user.rolNombre, id);
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

    @Post(':id/like')
  @HttpCode(200)
  darLike(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.darLike(user.sub, id);
  }
 
  @Delete(':id/like')
  @HttpCode(200)
  quitarLike(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.quitarLike(user.sub, id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string):Promise<void> {
    return this.service.remove(user.sub, id);
  }
}