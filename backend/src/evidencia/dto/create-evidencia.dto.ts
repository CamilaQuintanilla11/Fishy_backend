import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateEvidenciaDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  perteneceAReporte: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  url: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

}