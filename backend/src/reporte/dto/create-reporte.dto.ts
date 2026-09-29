import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReporteDto {
  @IsArray()
  @IsUUID('4', { each: true})
  categorias: string[];
}
