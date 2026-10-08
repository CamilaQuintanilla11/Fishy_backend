import { ArrayNotEmpty, IS_ALPHA, IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true})
  categorias: string[];
}
