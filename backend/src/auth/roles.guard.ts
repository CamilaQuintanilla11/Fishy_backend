import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtPayload } from './jwt';
import { RolRepository } from 'src/rol/rol.repository';
import { ROLES_KEY } from './roles.decorator';
import { Reflector } from '@nestjs/core';


@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector, private readonly rolRepository: RolRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const RolesReq = this.reflector.getAllAndOverride<string[]> (
            ROLES_KEY, [context.getHandler(), context.getClass()],
        );

        if (!RolesReq || RolesReq.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        if (!user) {
            throw new UnauthorizedException('usuario no autenticado');
        }

        const rol = await this.rolRepository.findById(user.tieneRol);

        if (!rol) {
            throw new ForbiddenException('no hay rol válido')
        }

        if (!RolesReq.includes(rol.nombre)) {
            throw new ForbiddenException('no tienes permisos para realizar la acción');
        }

        return true;

    }
}