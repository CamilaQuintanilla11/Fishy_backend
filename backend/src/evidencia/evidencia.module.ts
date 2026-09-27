import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvidenciaController } from './evidencia.controller';
import { EvidenciaRepository } from './evidencia.repository';
import { EvidenciaService } from './evidencia.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [EvidenciaController],
  providers: [EvidenciaService, EvidenciaRepository],
})
export class EvidenciaModule {}