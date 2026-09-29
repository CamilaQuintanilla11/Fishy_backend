import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true})
  categorias: string[];
}
