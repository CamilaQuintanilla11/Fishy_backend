import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

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

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.usuarioService.obtener(id)
    }

    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    crear(@Body() dto: CreateUsuarioDto) {
        return this.usuarioService.crear(dto);
    }

    @Patch(':id')
    actualizar(@Param('id') id:string, @Body() dto: UpdateUsuarioDto){
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