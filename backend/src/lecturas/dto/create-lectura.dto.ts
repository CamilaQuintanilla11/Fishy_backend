import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLecturaDto {
  @ApiProperty({ example: '¿Qué es el phishing?' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: '## Señales de alerta\n- Urgencia\n- Te piden datos', description: 'Markdown' })
  @IsString()
  @IsNotEmpty()
  contenido: string;

  @ApiProperty({ example: 1, description: 'Módulo al que pertenece' })
  @IsInt()
  @Min(1)
  modulo: number;

  @ApiPropertyOptional({ example: 11, description: 'Si no viene, se pone al final' })
  @IsOptional()
  @IsInt()
  @Min(1)
  orden?: number;
}

export class UpdateLecturaDto extends PartialType(CreateLecturaDto) {}