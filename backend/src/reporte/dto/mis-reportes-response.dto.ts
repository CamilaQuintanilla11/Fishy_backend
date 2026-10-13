import { ApiProperty } from '@nestjs/swagger';
import { ReporteResponseDto } from './reporte-response.dto';

export class MisReportesResponseDto {
  @ApiProperty({ example: 3, description: 'Total de reportes del usuario, en cualquier estado' })
  totalReportes: number;

  @ApiProperty({ example: 12, description: 'Likes que dio el usuario en reportes de otras personas' })
  aportes: number;

  @ApiProperty({ type: () => [ReporteResponseDto] })
  reportes: ReporteResponseDto[];
}