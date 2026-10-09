import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../entities/rol.entity';

export class RolResponseDto {
    @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
    id: string;

    @ApiProperty({ example: 'usuario' })
    nombre: string;

    @ApiProperty({ example: 'user_gate' })
    gatename: string;

    constructor(rol: Rol) {
        this.id = rol.id;
        this.nombre = rol.nombre;
        this.gatename = rol.gatename;
    }
}