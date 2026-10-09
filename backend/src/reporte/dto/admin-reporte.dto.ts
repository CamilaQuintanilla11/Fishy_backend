import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty} from "class-validator";

export class ModerarReporteDto {
  @ApiProperty({ description: 'Id del nuevo estado (GET /estados): aprobado o rechazado', format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
  @IsUUID()
  @IsNotEmpty()
  tieneEstado: string;

  @ApiProperty({ description: 'Id del nivel de riesgo (GET /riesgos). Se valida, pero hoy no se guarda', format: 'uuid', example: '3f1c2e7a-9b4d-4e6f-8a1b-2c3d4e5f6a7b' })
  @IsUUID()
  @IsNotEmpty()
  tieneRiesgo: string;

}
