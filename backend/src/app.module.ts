import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CategoriaModule } from './categoria/categoria.module';
import { EstadoModule } from './estado/estado.module';
import { ReporteModule } from './reporte/reporte.module';
import { RiesgoModule } from './riesgo/riesgo.module';
import { EvidenciaModule } from './evidencia/evidencia.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
    ConfigModule.forRoot ({
      isGlobal: true,
    }),
    EstadoModule,
    CategoriaModule,
    DatabaseModule,
    RolModule,
    UsuarioModule,
    ReporteModule,
    RiesgoModule,
    EvidenciaModule,
  ],
  providers: [
    {provide: APP_GUARD, useClass: ThrottlerGuard},
  ],
})
export class AppModule {}