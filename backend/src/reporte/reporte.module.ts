import {Module} from '@nestjs/common';
import {DatabaseModule} from '../database/database.module';
import {ReporteController} from './reporte.controller';
import {ReporteRepository} from './reporte.repository';
import { ReporteService} from './reporte.service';
import { RiesgoModule } from 'src/riesgo/riesgo.module';
import { EstadoModule } from 'src/estado/estado.module';
import { AuthModule } from '../auth/auth.module';
import { RolModule } from 'src/rol/rol.module';

@Module({
  imports:[DatabaseModule, EstadoModule, RiesgoModule, AuthModule, RolModule],
  controllers:[ReporteController],
  providers:[ReporteService, ReporteRepository],
  exports: [ReporteRepository],
})
export class ReporteModule {}