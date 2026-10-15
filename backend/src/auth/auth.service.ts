import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { RolRepository } from '../rol/rol.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { sign, verify } from './jwt';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PerfilResponseDto } from './dto/perfil-response.dto';

const ACCESS_TTL = 15 * 60;
const REFRESH_TTL = 7 * 24 * 60 * 60;
const ROL_DEFAULT = 'usuario';


@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly rolRepository: RolRepository,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; correo: string; nombreUsuario: string }> {
    if (await this.usuarioRepository.findByCorreo(dto.correo)) {
      throw new ConflictException('Ese correo ya esta registrado');
    }

    if (await this.usuarioRepository.findByNombreUsuario(dto.nombreUsuario)) {
      throw new ConflictException('Ese nombre de usuario ya esta registrado');
    }
    
    const rolDefault = await this.rolRepository.findByNombre(ROL_DEFAULT);
    if (!rolDefault) {
      throw new Error(`El rol "${ROL_DEFAULT}" no existe -- revisa db/seed.sql`);
    }
    const usuario = await this.usuarioRepository.save({
      nombre: dto.nombre,
      correo: dto.correo,
      nombreUsuario: dto.nombreUsuario,
      contrasenaHash: await bcrypt.hash(dto.contrasena, 10),
      tieneRol: rolDefault.id,
    });
    return { id: usuario.id, correo: usuario.correo, nombreUsuario: usuario.nombreUsuario };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const usuario = await this.usuarioRepository.findByCorreo(dto.correo);
    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe');
    }

    const contrasenaCorrecta = await bcrypt.compare(dto.contrasena, usuario.contrasenaHash,);
    if (!contrasenaCorrecta) {
      throw new UnauthorizedException('Password incorrecto');
    }

    const rol = await this.rolRepository.findById(usuario.tieneRol);
    if (!rol) {
      throw new Error(`El usuario tiene un tieneRol que no existe en la tabla rol`);
    }

    const claims = {
      sub: usuario.id,
      correo: usuario.correo,
      tieneRol: usuario.tieneRol,
      rolNombre: rol.nombre,
    };
    const accessToken = sign({ ...claims, type: 'access' }, ACCESS_TTL);
    const refreshToken = sign({ ...claims, type: 'refresh' }, REFRESH_TTL);
    console.log('Login de '+usuario.correo+': '+accessToken);
    return { accessToken, refreshToken };
  }

  refresh(dto: RefreshDto): { accessToken: string } {
    const payload = verify(dto.refreshToken);
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token invalido');
    }
    const accessToken = sign(
      {
        sub: payload.sub,
        correo: payload.correo,
        tieneRol: payload.tieneRol,
        rolNombre: payload.rolNombre,
        type: 'access',
      },
      ACCESS_TTL,
    );
    return { accessToken };
  }

  async perfil(usuarioId: string): Promise<PerfilResponseDto> {
    const usuario = await this.usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const rol = await this.rolRepository.findById(usuario.tieneRol);
    if (!rol) {
      throw new Error(`El usuario tiene un tieneRol que no existe en la tabla rol`);
    }
    return {
      id: usuario.id,
      nombre: usuario.nombre,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
      rol: rol.nombre,
    };
  }
}

  function hash(contrasena: string): string {
    return createHash('sha256').update(contrasena).digest('hex');
}