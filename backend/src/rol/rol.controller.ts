import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolResponseDto } from './dto/rol-response.dto';
import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Falta el token, es inválido o expiró',
})
@UseGuards(AuthGuard)
@Controller('roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}
  
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Listar roles (solo admin)' })
  @ApiResponse({ status: 200, type: [RolResponseDto] })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  listar() {
    return this.rolService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver un rol' })
  @ApiResponse({ status: 200, type: RolResponseDto })
  @ApiResponse({ status: 404, description: 'No existe un rol con ese id' })
  obtener(@Param('id') id: string) {
    return this.rolService.obtener(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Crear un rol (solo admin)' })
  @ApiResponse({ status: 201, type: RolResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 409, description: 'Ya existe un rol con ese nombre o gatename' })
  crear(@Body() dto: CreateRolDto) {
    return this.rolService.crear(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Editar un rol (solo admin)' })
  @ApiResponse({ status: 200, type: RolResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 404, description: 'No existe un rol con ese id' })
  @ApiResponse({ status: 409, description: 'Ya existe un rol con ese nombre' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateRolDto) {
    return this.rolService.actualizar(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Borrar un rol (solo admin)' })
  @ApiResponse({ status: 204, description: 'Borrado; sin cuerpo' })
  @ApiResponse({ status: 403, description: 'Requiere rol admin' })
  @ApiResponse({ status: 404, description: 'No existe un rol con ese id' })
  eliminar(@Param('id') id: string) {
    return this.rolService.eliminar(id);
  }
}
