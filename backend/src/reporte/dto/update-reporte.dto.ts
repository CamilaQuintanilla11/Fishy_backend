import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteDto } from './create-reporte.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateReporteDto {
  @ApiPropertyOptional({
    description: 'Ids de categorías; si viene, reemplaza a todas las anteriores',
    type: [String],
    format: 'uuid',
    example: ['3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categorias?: string[];

  @ApiPropertyOptional({ example: 'SMS falso del banco pidiendo actualizar datos' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;
}
