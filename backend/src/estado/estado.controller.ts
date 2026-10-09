import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EstadoResponseDto } from './dto/estado-response.dto';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EstadoService } from './estado.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('estados')
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Falta el token, es inválido o expiró',
})
@UseGuards(AuthGuard)
@Controller('estados')
export class EstadoController {
    constructor(private readonly estadoService: EstadoService) {}

    @Get()
    @ApiOperation({ summary: 'Listar estados de moderación (pendiente, aprobado, rechazado)' })
    @ApiResponse({ status: 200, type: [EstadoResponseDto] })
    listar() {
        return this.estadoService.listar();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Ver un estado' })
    @ApiResponse({ status: 200, type: EstadoResponseDto })
    @ApiResponse({ status: 404, description: 'No existe un estado con ese id' })
    obtener(@Param('id') id: string) {
        return this.estadoService.obtener(id);
    }
}