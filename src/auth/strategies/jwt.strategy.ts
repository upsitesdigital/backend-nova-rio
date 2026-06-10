import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  type: 'client' | 'admin';
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'client') {
      const client = await this.prisma.client.findUnique({
        where: { id: payload.sub },
        select: { status: true },
      });
      if (!client || client.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }
    } else {
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: { status: true },
      });
      if (!admin || admin.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Account is not active');
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
      role: payload.role,
    };
  }
}
