import { ApiProperty } from '@nestjs/swagger';
import { Riesgo } from "../entities/riesgo.entity";

export class RiesgoResponseDto {
    @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
    id: string;

    @ApiProperty({ example: 'Alto', description: 'Bajo, Medio o Alto' })
    nombre: string;

    constructor(riesgo: Riesgo) {
        this.id = riesgo.id;
        this.nombre = riesgo.nombre;
    }
}