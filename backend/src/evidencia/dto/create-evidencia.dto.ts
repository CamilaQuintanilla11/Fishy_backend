import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEvidenciaDto {
  @ApiProperty({ description: 'Id del reporte; tiene que ser tuyo', format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  perteneceAReporte: string;

  @ApiProperty({ description: 'URL o dominio sospechoso', maxLength: 255, example: 'http://banco-seguro-mx.example/login' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @ApiProperty({ example: 'Me llegó por SMS diciendo que mi cuenta estaba bloqueada' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

}