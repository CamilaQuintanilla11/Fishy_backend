import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DB_POOL } from '../database/database.module';
import { Usuario } from './entities/usuario.entity';

const COLUMNS = 'id, correo, nombre, contrasenaHash, fecha_creado, tieneRol';

@Injectable()
export class UsuarioRepository {
    constructor(@Inject(DB_POOL) private readonly pool: Pool) { }

    async findAll(): Promise<Usuario[]>{
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM usuario ORDER BY fecha_creado DESC`
        );
        return rows.map(toEntity);
    }
    async findById(id: string): Promise<Usuario | undefined> {
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM usuario WHERE id = '${id}'`
        );
        return rows[0] && toEntity(rows[0]);
    }
    async findByCorreo(correo: string): Promise<Usuario | undefined>{
        const [rows] = await this.pool.query<RowDataPacket[]>(
            `SELECT ${COLUMNS} FROM usuario WHERE correo = '${correo}'`
        );
        return rows[0] && toEntity(rows[0]);
    }
    async save(usuario: Omit<Usuario, 'id' | 'fecha_creado'>): Promise<Usuario> {
        const id = randomUUID();
        await this.pool.query(
            `INSERT INTO usuario (id, nombre, correo, contrasenaHash, tieneRol) VALUES ('${id}', '${usuario.nombre}', '${usuario.correo}', '${usuario.contrasenaHash}', '${usuario.tieneRol}')`
        );
        return (await this.findById(id))!;
    }
    async update(id: string, changes: Partial<Usuario>): Promise<Usuario | undefined> {
        const allowedColumns = ['nombre', 'correo', 'contrasenaHash'];
        const entries = Object.entries(changes).filter(([column, value]) => allowedColumns.includes(column) && value !== undefined);
        if (entries.length === 0) return this.findById(id);

        const sets = entries.map(([column]) => `${column} = ?`).join(', ');
        const values = entries.map(([, value]) => value);

        await this.pool.query(`UPDATE usuario SET ${sets} WHERE id = '${id}'`, [...values]);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const [result] = await this.pool.query<ResultSetHeader> (
            `DELETE FROM usuario WHERE id = '${id}'`,
            [id],
        );
        return result.affectedRows > 0;
    }
}

function toEntity(row: any): Usuario {
    const usuario = new Usuario();
    usuario.id = row.id;
    usuario.nombre = row.nombre;
    usuario.correo = row.correo;
    usuario.contrasenaHash = row.contrasenaHash;
    usuario.fecha_creado = row.fecha_creado;
    usuario.tieneRol = row.tieneRol;
    return usuario;
}