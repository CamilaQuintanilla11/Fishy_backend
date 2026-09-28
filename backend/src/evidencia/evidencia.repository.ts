import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Evidencia } from './entities/evidencia.entity';

const COLUMNS = 'id, url, foto, fecha_creado, perteneceAReporte';
const UPDATABLE = ['url', 'foto'];

@Injectable()
export class EvidenciaRepository {
  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async findAll(): Promise<Evidencia[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM evidencia ORDER BY fecha_creado DESC`,
    );
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Evidencia | undefined> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM evidencia WHERE id = ?`,
      [id],
    );
    return rows[0] && toEntity(rows[0]);
  }

  async findByReporteId(reporteId: string): Promise<Evidencia[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNS} FROM evidencia WHERE perteneceAReporte = ? ORDER BY fecha_creado DESC`,
      [reporteId],
    );
    return rows.map(toEntity);
  }

  async save(data: { url: string; foto: string; perteneceAReporte: string }): Promise<Evidencia> {
    const id = randomUUID();
    await this.pool.query(
      `INSERT INTO evidencia (id, url, foto, perteneceAReporte) VALUES (?, ?, ?, ?)`,
      [id, data.url, data.foto, data.perteneceAReporte],
    );
    return (await this.findById(id))!;
  }

  async update(id: string, changes: Partial<Evidencia>): Promise<Evidencia | undefined> {
    const entries = Object.entries(changes).filter(
      ([column, value]) => UPDATABLE.includes(column) && value !== undefined,
    );
    if (entries.length === 0) return this.findById(id);
    const sets = entries.map(([column]) => `${column} = ?`).join(', ');
    const values = entries.map(([, value]) => value);
    await this.pool.query(`UPDATE evidencia SET ${sets} WHERE id = ?`, [...values, id]);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await this.pool.query<ResultSetHeader>(
      `DELETE FROM evidencia WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  async setPhoto(id: string, filename: string): Promise<Evidencia | undefined> {
    return this.update(id, { foto: filename });
  }
}

function toEntity(row: any): Evidencia {
  const evidencia = new Evidencia();
  evidencia.id = row.id;
  evidencia.url = row.url;
  evidencia.foto = row.foto;
  evidencia.fecha_creado = row.fecha_creado;
  evidencia.perteneceAReporte = row.perteneceAReporte;
  return evidencia;
}