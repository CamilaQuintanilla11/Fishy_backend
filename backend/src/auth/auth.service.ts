import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { RolRepository } from '../rol/rol.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { sign, verify } from './jwt';
import { hash } from './crypto';

const ACCESS_TTL = 15 * 60; 
const REFRESH_TTL = 7 * 24 * 60 * 60; 
const ROL_DEFAULT = 'usuario';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly rolRepository: RolRepository,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; correo: string }> {
    const correo = dto.correo;
    if (!correo) {
      throw new BadRequestException('El correo es obligatorio');
    }
    if (await this.usuarioRepository.findByCorreo(correo)) {
      throw new ConflictException('Ese correo ya esta registrado');
    }

    const rolDefault = await this.rolRepository.findByNombre(ROL_DEFAULT);
    if (!rolDefault) {
      throw new Error(`El rol "${ROL_DEFAULT}" no existe -- revisa db/seed.sql`);
    }
    if (!dto.contrasena) {
      throw new BadRequestException('La contrasena es obligatoria');
    }

    const usuario = await this.usuarioRepository.save({
      nombre: dto.nombre,
      correo,
      contrasenaHash: hash(dto.contrasena),
      tieneRol: rolDefault.id,
    });
    return { id: usuario.id, correo: usuario.correo };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    if (!dto.correo) {
      throw new BadRequestException('El correo es obligatorio');
    }
    const usuario = await this.usuarioRepository.findByCorreo(dto.correo);
    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe');
    }
    if (!dto.contrasena) {
      throw new BadRequestException('La contrasena es obligatoria');
    }
    if (usuario.contrasenaHash !== hash(dto.contrasena)) {
      throw new UnauthorizedException('Contrasena incorrecta');
    }

    const claims = { sub: usuario.id, correo: usuario.correo, tieneRol: usuario.tieneRol };
    const accessToken = sign({ ...claims, type: 'access' }, ACCESS_TTL);
    const refreshToken = sign({ ...claims, type: 'refresh' }, REFRESH_TTL);
    return { accessToken, refreshToken };
  }

  refresh(dto: RefreshDto): { accessToken: string } {
    if (!dto.refreshToken) {
      throw new BadRequestException('Refresh token invalido');
    }
    const payload = verify(dto.refreshToken);
    if (!payload || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token invalido');
    }
    const accessToken = sign(
      { sub: payload.sub, correo: payload.correo, tieneRol: payload.tieneRol, type: 'access' },
      ACCESS_TTL,
    );
    return { accessToken };
  }
}
