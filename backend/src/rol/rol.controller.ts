import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@UseGuards(AuthGuard)
@Controller('roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}
  
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  listar() {
    return this.rolService.listar();
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.rolService.obtener(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  crear(@Body() dto: CreateRolDto) {
    return this.rolService.crear(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateRolDto) {
    return this.rolService.actualizar(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(204)
  eliminar(@Param('id') id: string) {
    return this.rolService.eliminar(id);
  }
}
