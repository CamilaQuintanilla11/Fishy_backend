import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise';
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
  async findCategorias(reporteId: string): Promise<string[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT categoria_id FROM reporte_categoria WHERE reporte_id = ?`,
      [reporteId],
    );
    return rows.map((r) => r.categoria_id);
  }
  async listarPorReportes(reporteIds: string[]): Promise<Map<string, string[]>> {
  if (reporteIds.length === 0) return new Map();
  const placeholders = reporteIds.map(() => '?').join(',');
  const [rows] = await this.pool.query<RowDataPacket[]>(
    `SELECT reporte_id, categoria_id FROM reporte_categoria WHERE reporte_id IN (${placeholders})`,
    reporteIds,
  );
  const mapa = new Map<string, string[]>();
  for (const row of rows) {
    const lista = mapa.get(row.reporte_id) ?? [];
    lista.push(row.categoria_id);
    mapa.set(row.reporte_id, lista);
  }
  return mapa;
}
}