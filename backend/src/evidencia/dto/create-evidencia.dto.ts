import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEvidenciaDto {
  @IsString()
  @IsNotEmpty()
  perteneceAReporte: string;
  @IsString()
  @IsNotEmpty()
  url: string;
  @IsString()
  @IsNotEmpty()
  foto: string;
}