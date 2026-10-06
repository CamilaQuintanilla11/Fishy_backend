import { ArrayNotEmpty, IS_ALPHA, IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true})
  categorias: string[];
}
