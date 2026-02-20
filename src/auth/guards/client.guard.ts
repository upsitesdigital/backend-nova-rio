import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

interface AuthUser {
  id: number;
  email: string;
  type: string;
}

@Injectable()
export class ClientGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser;

    if (user.type !== 'client') {
      throw new ForbiddenException('Only clients can access this resource');
    }

    return true;
  }
}
