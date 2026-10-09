import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { JwtPayload } from 'src/auth/jwt';

@UseGuards(AuthGuard)
@Controller('usuarios')
export class UsuarioController {
    constructor (private readonly usuarioService: UsuarioService) {}

    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    listar() {
        return this.usuarioService.listar();
    }

        @Get('me')
    perfil(@CurrentUser() user: JwtPayload) {
        return this.usuarioService.obtener(user.sub);
    }
    
    @Get(':id')
    obtener(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        verificarPropio(user, id);
        return this.usuarioService.obtener(id)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    crear(@Body() dto: CreateUsuarioDto) {
        return this.usuarioService.crear(dto);
    }

    @Patch(':id')
    actualizar(@CurrentUser() user: JwtPayload, @Param('id') id:string, @Body() dto: UpdateUsuarioDto){
        verificarPropio(user, id);
        return this.usuarioService.actualizar(id, dto);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @HttpCode(204)
    eliminar(@Param('id') id:string) {
        return this.usuarioService.eliminar(id);
    }
}

function verificarPropio(user: JwtPayload, id: string): void {
    if (user.sub !== id && user.rolNombre !== 'admin') {
        throw new ForbiddenException('Solo puedes ver o editar tu propio usuario');
    }
}
