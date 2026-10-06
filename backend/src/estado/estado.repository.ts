import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Estado } from './entities/estado.entity';

const COLUMNS = 'id, nombre';

@Injectable()
export class EstadoRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

    async findAll(): Promise<Estado[]>{
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM estado ORDER BY nombre`,    
        );
        return rows.map(toEntity);
    }

    async findById(id: string): Promise<Estado | undefined> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM estado WHERE id = '${id}'`,
        );
        return rows[0] && toEntity(rows[0]);
    }

    async findByNombre(nombre: string): Promise<Estado | undefined> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM estado WHERE nombre = '${nombre}'`,
        );
        return rows[0] && toEntity(rows[0]);
    }
}

function toEntity(row: any): Estado {
    const estado = new Estado();
    estado.id = row.id;
    estado.nombre = row.nombre;
    return estado;
}
