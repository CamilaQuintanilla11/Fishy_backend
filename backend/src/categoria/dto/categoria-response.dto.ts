import { ApiProperty } from '@nestjs/swagger';
import { Categoria } from '../entities/categoria.entity';

export class CategoriaResponseDto {
    @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
    id: string;

    @ApiProperty({ example: 'SMS' })
    nombre: string;

    constructor(categoria: Categoria) {
        this.id = categoria.id;
        this.nombre = categoria.nombre;
    }
}