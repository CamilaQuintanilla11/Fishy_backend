import { PartialType } from '@nestjs/mapped-types';
import { CreateReporteDto } from './create-reporte.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateReporteDto {
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  categorias?: string[];

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  titulo?: string;
}
