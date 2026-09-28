import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateEvidenciaDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  perteneceAReporte: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

}