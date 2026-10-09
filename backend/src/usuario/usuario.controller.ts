import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { JwtPayload } from 'src/auth/jwt';

@ApiTags('usuarios')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Falta el token, es inválido o expiró',
})
@UseGuards(AuthGuard)
@Controller('usuarios')
export class UsuarioController {
    constructor (private readonly usuarioService: UsuarioService) {}

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Listar usuarios (solo admin)' })
    @ApiResponse({ status: 200, type: [UsuarioResponseDto] })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    listar() {
        return this.usuarioService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Ver un usuario (el tuyo; admin: cualquiera)' })
    @ApiResponse({ status: 200, type: UsuarioResponseDto })
    @ApiResponse({ status: 403, description: 'Solo puedes ver o editar tu propio usuario' })
    @ApiResponse({ status: 404, description: 'No existe un usuario con ese id' })
    obtener(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        verificarPropio(user, id);
        return this.usuarioService.obtener(id)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Crear un usuario con rol usuario (solo admin)' })
    @ApiResponse({ status: 201, type: UsuarioResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos (contraseña de 10 a 72 caracteres)' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 409, description: 'Ya hay un usuario con ese correo' })
    crear(@Body() dto: CreateUsuarioDto) {
        return this.usuarioService.crear(dto);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Editar nombre, correo o contraseña (el tuyo; admin: cualquiera)' })
    @ApiResponse({ status: 200, type: UsuarioResponseDto })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 403, description: 'Solo puedes ver o editar tu propio usuario' })
    @ApiResponse({ status: 404, description: 'No existe un usuario con ese id' })
    actualizar(@CurrentUser() user: JwtPayload, @Param('id') id:string, @Body() dto: UpdateUsuarioDto){
        verificarPropio(user, id);
        return this.usuarioService.actualizar(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @HttpCode(204)
    @ApiOperation({ summary: 'Borrar un usuario (solo admin)' })
    @ApiResponse({ status: 204, description: 'Borrado; sin cuerpo' })
    @ApiResponse({ status: 403, description: 'Requiere rol admin' })
    @ApiResponse({ status: 404, description: 'No existe un usuario con ese id' })
    eliminar(@Param('id') id:string) {
        return this.usuarioService.eliminar(id);
    }
}

function verificarPropio(user: JwtPayload, id: string): void {
    if (user.sub !== id && user.rolNombre !== 'admin') {
        throw new ForbiddenException('Solo puedes ver o editar tu propio usuario');
    }
}
