import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true})
  categorias: string[];
}
