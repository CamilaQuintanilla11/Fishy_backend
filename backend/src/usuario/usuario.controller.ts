import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('usuarios')
export class UsuarioController {
    constructor (private readonly usuarioService: UsuarioService) {}

    @Get()
    listar() {
        return this.usuarioService.listar();
    }

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.usuarioService.obtener(id)
    }

    @Post()
    crear(@Body() dto: CreateUsuarioDto) {
        return this.usuarioService.crear(dto);
    }

    @Patch(':id')
    actualizar(@Param('id') id:string, @Body() dto: UpdateUsuarioDto){
        return this.usuarioService.actualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    eliminar(@Param('id') id:string) {
        return this.usuarioService.eliminar(id);
    }
}