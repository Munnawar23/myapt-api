import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from '../../rbac.service';
import { PERMISSIONS_KEY } from '../../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get the required permissions from the decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If a route has no @RequirePermission decorator, allow access
    if (!requiredPermissions) {
      return true;
    }

    // 2. Get the user object from the request.
    // THIS ASSUMES an authentication guard has already run and attached the user.
    const { user } = context.switchToHttp().getRequest();
    console.log('user from permission guard', user);
    // If there's no user, deny access (should be handled by AuthGuard, but good practice)
    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated.');
    }

    // 3. Get the user's permissions from our RBAC service
    const userPermissions = await this.rbacService.getUserPermissions(user.id);

    // 4. Check if the user's permissions satisfy the required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );

    if (hasPermission) {
      return true;
    } else {
      // If the user does not have the required permission, deny access.
      throw new ForbiddenException(
        'You do not have the required permissions to access this resource.',
      );
    }
  }
}
