import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../../shared/types/auth-user.type.js';

@Injectable()
export class ClientGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser;

    if (user.type !== 'client') {
      throw new ForbiddenException('Only clients can access this resource');
    }

    // TODO: Check client status === 'ACTIVE' and block PENDING/INACTIVE users (business rule from briefing)

    return true;
  }
}
