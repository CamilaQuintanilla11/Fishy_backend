import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class RegisterDto {
    @ApiProperty({ description: 'Nombre que aparece como autor de sus reportes', example: 'Ana López' })
    @IsString()
    @IsNotEmpty()
    nombre: string

    @ApiProperty({ example: 'ana@example.com' })
    @IsEmail()
    correo: string;

    @ApiProperty({ example: 'secreto123', minLength: 8 })
    @IsString()
    @MinLength(8)
    contrasena: string;
}