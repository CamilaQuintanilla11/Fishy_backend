import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriaDto {
    @ApiProperty({ example: 'SMS' })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
