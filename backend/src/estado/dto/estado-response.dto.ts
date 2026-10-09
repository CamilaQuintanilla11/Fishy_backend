import { ApiProperty } from '@nestjs/swagger';
import { Estado } from '../entities/estado.entity';

export class EstadoResponseDto {
    @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
    id: string;

    @ApiProperty({ example: 'aprobado', description: 'pendiente, aprobado o rechazado' })
    nombre: string;
    
    constructor(estado: Estado) {
        this.id = estado.id;
        this.nombre = estado.nombre;
    }
}