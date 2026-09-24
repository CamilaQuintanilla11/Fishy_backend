import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('estados')
export class EstadoController {
    constructor(private readonly estadoService: EstadoService) {}

    @Get()
    listar() {
        return this.estadoService.listar();
    }

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.estadoService.obtener(id);
    }
}