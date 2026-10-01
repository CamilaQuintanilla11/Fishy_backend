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
import { CategoriaModule } from 'src/categoria/categoria.module';
import { forwardRef} from '@nestjs/common';
import { EvidenciaModule } from '../evidencia/evidencia.module';

@Module({
  imports:[DatabaseModule, EstadoModule, RiesgoModule, AuthModule, RolModule, CategoriaModule, forwardRef(() => EvidenciaModule)],
  controllers:[ReporteController],
  providers:[ReporteService, ReporteRepository, ReporteCategoriaRepository],
  exports: [ReporteRepository],
})
export class ReporteModule {}