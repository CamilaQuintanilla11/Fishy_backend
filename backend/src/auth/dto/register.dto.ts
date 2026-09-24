import { IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    nombre: string

    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(8)
    contrasena: string;
}