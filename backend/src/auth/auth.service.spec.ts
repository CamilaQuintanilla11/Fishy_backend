
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { RolRepository } from '../rol/rol.repository';
import { jest } from '@jest/globals';

describe('HU02 - Iniciar sesión', () => {
  let service: AuthService;

  const usuariosRepo = {
    findByCorreo: jest.fn<(...args: any[]) => Promise<any>>(),
  };

  const rolesRepo = {
    findById: jest.fn<(...args: any[]) => Promise<any>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new AuthService(
      usuariosRepo as unknown as UsuarioRepository,
      rolesRepo as unknown as RolRepository,
    );
  });

  it('test_cp01_login_exitoso', async () => {
    const hash = await bcrypt.hash('Fishy#2026', 10);

    usuariosRepo.findByCorreo.mockResolvedValue({
      id: 'U-001',
      correo: 'ana@correo.com',
      contrasenaHash: hash,
      tieneRol: 'ROL-001',
    });

    rolesRepo.findById.mockResolvedValue({
      id: 'ROL-001',
      nombre: 'usuario',
    });

    const resultado = await service.login({
      correo: 'ana@correo.com',
      contrasena: 'Fishy#2026',
    });

    expect(resultado.accessToken).toBeDefined();
    expect(resultado.refreshToken).toBeDefined();
    expect(usuariosRepo.findByCorreo).toHaveBeenCalledWith(
      'ana@correo.com',
    );
    expect(rolesRepo.findById).toHaveBeenCalledWith('ROL-001');
  });

  it('test_cp02_login_fallido_por_contrasena_incorrecta', async () => {
    const hash = await bcrypt.hash('Fishy#2026', 10);

    usuariosRepo.findByCorreo.mockResolvedValue({
      id: 'U-001',
      correo: 'ana@correo.com',
      contrasenaHash: hash,
      tieneRol: 'ROL-001',
    });

    await expect(
      service.login({
        correo: 'ana@correo.com',
        contrasena: 'incorrecta',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(rolesRepo.findById).not.toHaveBeenCalled();
  });

  it('test_cp03_login_fallido_por_usuario_inexistente', async () => {
    usuariosRepo.findByCorreo.mockResolvedValue(null);

    await expect(
      service.login({
        correo: 'inexistente@correo.com',
        contrasena: 'Fishy#2026',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(rolesRepo.findById).not.toHaveBeenCalled();
  });
});
