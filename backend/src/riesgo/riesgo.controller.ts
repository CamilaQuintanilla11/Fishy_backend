import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('riesgos')
export class RiesgoController {
    constructor(private readonly riesgoService: RiesgoService) {}

    @Get()
    listar() {
        return this.riesgoService.listar();
    }

    @Get(':id')
    obtener(@Param('id') id: string) {
        return this.riesgoService.obtener(id);
    }
}