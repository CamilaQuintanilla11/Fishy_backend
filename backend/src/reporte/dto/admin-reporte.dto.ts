import { IsUUID, IsNotEmpty} from "class-validator";

export class ModerarReporteDto {
  @IsUUID()
  @IsNotEmpty()
  tieneEstado: string;

  @IsUUID()
  @IsNotEmpty()
  tieneRiesgo: string;

}
