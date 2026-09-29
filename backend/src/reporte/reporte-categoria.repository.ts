import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';

@Injectable()
export class ReporteCategoriaRepository {
  constructor( @Inject(DB_POOL) private readonly pool: Pool,) {}

  async agregar(reporteId: string, categoriaId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO reporte_categoria
        (reporte_id, categoria_id) VALUES (?, ?)`,
      [reporteId, categoriaId],
    );
  }

  async agregarVarias(reporteId: string, categoriaIds: string[]): Promise<void> {
    for (const categoriaId of categoriaIds) {
      await this.agregar(reporteId, categoriaId);
    }
  }

  async eliminarTodas(reporteId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM reporte_categoria WHERE reporte_id = ?`,
      [reporteId],
    );
  }
}