import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength,} from 'class-validator';

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
}
