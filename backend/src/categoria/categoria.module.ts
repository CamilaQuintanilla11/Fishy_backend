import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';
import { CategoriaRepository } from './categoria.repository';
import { DatabaseModule } from 'src/database/database.module';
import { RolModule } from 'src/rol/rol.module';

@Module({
    imports: [DatabaseModule, RolModule],
    controllers: [CategoriaController],
    providers: [CategoriaService, CategoriaRepository],
    exports: [CategoriaRepository],
})
export class CategoriaModule {}