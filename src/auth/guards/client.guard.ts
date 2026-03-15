import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../../shared/types/auth-user.type.js';
import { CLIENT_REPOSITORY } from '../domain/interfaces/client.repository.interface.js';
import type { IClientRepository } from '../domain/interfaces/client.repository.interface.js';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(@Inject(CLIENT_REPOSITORY) private clientRepository: IClientRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser;

    if (user.type !== 'client') {
      throw new ForbiddenException('Only clients can access this resource');
    }

    const client = await this.clientRepository.findById(user.id);

    if (!client || client.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is not active');
    }

    return true;
  }
}
