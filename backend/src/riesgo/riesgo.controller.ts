import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RiesgoResponseDto } from './dto/riesgo-response.dto';

@ApiTags('riesgos')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Falta el token, es inválido o expiró',
})
@UseGuards(AuthGuard)
@Controller('riesgos')
export class RiesgoController {
    constructor(private readonly riesgoService: RiesgoService) {}

    @Get()
    @ApiOperation({ summary: 'Listar niveles de riesgo (Bajo, Medio, Alto)' })
    @ApiResponse({ status: 200, type: [RiesgoResponseDto] })
    listar() {
        return this.riesgoService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Ver un nivel de riesgo' })
    @ApiResponse({ status: 200, type: RiesgoResponseDto })
    @ApiResponse({ status: 404, description: 'No existe un nivel de riesgo con ese id' })
    obtener(@Param('id') id: string) {
        return this.riesgoService.obtener(id);
    }
}