import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('categorias')
export class CategoriaController {
    constructor(private readonly categoriaService: CategoriaService) {}

    @Get()
    listar() {
        return this.categoriaService.listar();
    }

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.categoriaService.obtener(id);
    }

    @Post()
    crear(@Body() dto: CreateCategoriaDto) {
        return this.categoriaService.crear(dto);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
        return this.categoriaService.actualizar(id, dto);
    }

    @Delete(':id')
    @HttpCode(204)
    eliminar(@Param('id') id: string) {
        return this.categoriaService.eliminar(id);
    }
}