import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvidenciaController } from './evidencia.controller';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaService } from './evidencia.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EvidenciaController],
  providers: [EvidenciaService, EvidenciaRepository],
})
export class EvidenciaModule {}