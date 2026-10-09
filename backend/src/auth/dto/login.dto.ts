import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: 'ana@example.com' })
    @IsEmail()
    correo: string;

    @ApiProperty({ example: 'secreto123' })
    @IsString()
    contrasena: string;
}