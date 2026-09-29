import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true})
  categorias: string[];
}
