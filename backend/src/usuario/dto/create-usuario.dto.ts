import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength,} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana López' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  correo: string;

  @ApiProperty({ example: 'secreto1234', minLength: 10, maxLength: 72 })
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  contrasena: string;

  @ApiProperty({ example: 'ana_lopez' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_.]+$/, {message: 'El nombre de usuario solo puede tener letras, numeros, guion bajo y punto'})
  nombreUsuario: string;
}
