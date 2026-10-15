import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches} from "class-validator";

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

    @ApiProperty({ description: 'Nombre de usuario único para iniciar sesión', example: 'ana_lopez' })
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9_.]+$/, {message: 'El nombre de usuario solo puede tener letras, numeros, guion bajo y punto'})
    nombreUsuario: string;
}

