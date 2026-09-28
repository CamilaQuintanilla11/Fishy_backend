import { Module } from '@nestjs/common';
import { RiesgoService } from './riesgo.service';
import { RiesgoController } from './riesgo.controller';
import { RiesgoRepository } from './riesgo.repository';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [RiesgoController],
    providers: [RiesgoService, RiesgoRepository],
    exports: [RiesgoRepository],
})
export class RiesgoModule {}