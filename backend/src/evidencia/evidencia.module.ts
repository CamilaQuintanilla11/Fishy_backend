import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvidenciaController } from './evidencia.controller';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaService } from './evidencia.service';
import { AuthModule } from '../auth/auth.module';
import { ReporteModule } from 'src/reporte/reporte.module';

@Module({
  imports: [DatabaseModule, ReporteModule, AuthModule],
  controllers: [EvidenciaController],
  providers: [EvidenciaService, EvidenciaRepository],
})
export class EvidenciaModule {}