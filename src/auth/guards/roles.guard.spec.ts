import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'ADMIN' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user does not have required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'USER' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return false if user has no role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
