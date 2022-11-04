import { ROLES_KEY } from '@decorators/roles.decorator';
import { Roles } from '@modules/role/role.constant';
import { RoleService } from '@modules/role/role.service';
import User from '@modules/user/entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: string[] = this.reflector.getAllAndOverride<Roles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();

    const user: User | undefined = request?.user;

    if (!user?.is_active) {
      throw new NotAcceptableException('User is not active');
    }

    if (requiredRoles.length === 0) {
      return true;
    }

    const isValid: boolean = await this.roleService.can(
      user.roles,
      requiredRoles[0],
    );

    if (!isValid) {
      throw new ForbiddenException();
    }

    return true;
  }
}
