import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../entities/usuario.entity';

export class UsuarioResponseDto {
    @ApiProperty({ format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
    id: string;

    @ApiProperty({ example: 'Ana López' })
    nombre: string;

    @ApiProperty({ example: 'ana@example.com' })
    correo: string;

    @ApiProperty({ example: '2026-10-09T15:00:00.000Z', description: 'ISO 8601' })
    fecha_creado: Date;

    constructor(usuario: Usuario) {
        this.id = usuario.id;
        this.nombre = usuario.nombre;
        this.correo = usuario.correo;
        this.fecha_creado = usuario.fecha_creado;
    }
}