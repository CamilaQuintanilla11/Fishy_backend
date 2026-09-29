import {Module} from '@nestjs/common';
import {DatabaseModule} from '../database/database.module';
import {ReporteController} from './reporte.controller';
import {ReporteRepository} from './reporte.repository';
import { ReporteService} from './reporte.service';
import { RiesgoModule } from 'src/riesgo/riesgo.module';
import { EstadoModule } from 'src/estado/estado.module';
import { AuthModule } from '../auth/auth.module';
import { RolModule } from 'src/rol/rol.module';
import { ReporteCategoriaRepository } from './reporte-categoria.repository';

@Module({
  imports:[DatabaseModule, EstadoModule, RiesgoModule, AuthModule, RolModule, CategoriaModule],
  controllers:[ReporteController],
  providers:[ReporteService, ReporteRepository, ReporteCategoriaRepository],
  exports: [ReporteRepository],
})
export class ReporteModule {}