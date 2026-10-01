import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvidenciaController } from './evidencia.controller';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaService } from './evidencia.service';
import { AuthModule } from '../auth/auth.module';
import { ReporteModule } from 'src/reporte/reporte.module';
import { forwardRef } from '@nestjs/common';
import { EstadoModule } from 'src/estado/estado.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => ReporteModule), AuthModule, EstadoModule],
  controllers: [EvidenciaController],
  providers: [EvidenciaService, EvidenciaRepository],
  exports: [EvidenciaRepository],
})
export class EvidenciaModule {}