import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength,} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(10)
  @MaxLength(72)
  contrasena: string;
}
