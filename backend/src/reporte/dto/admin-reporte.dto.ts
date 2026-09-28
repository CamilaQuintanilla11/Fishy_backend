import { IsUUID } from "class-validator";

export class ModerarReporteDto {
    @IsUUID()
    tieneEstado: string;
}