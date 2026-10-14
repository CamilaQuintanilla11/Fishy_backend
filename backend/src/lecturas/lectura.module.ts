import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RolModule } from 'src/rol/rol.module';
import { LecturaController } from './lectura.controller';
import { LecturaService } from './lectura.service';
import { LecturaRepository } from './lectura.repository';
 
@Module({
  imports: [DatabaseModule, AuthModule, RolModule],
  controllers: [LecturaController],
  providers: [LecturaService, LecturaRepository],
  exports: [LecturaRepository],
})
export class LecturaModule {}