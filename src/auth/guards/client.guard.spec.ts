import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ClientGuard } from './client.guard.js';

describe('ClientGuard', () => {
  let guard: ClientGuard;

  beforeEach(() => {
    guard = new ClientGuard();
  });

  const mockContext = (userType: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 1, email: 'test@test.com', type: userType },
        }),
      }),
    }) as unknown as ExecutionContext;

  it('should allow client users', () => {
    expect(guard.canActivate(mockContext('client'))).toBe(true);
  });

  it('should throw ForbiddenException for admin users', () => {
    expect(() => guard.canActivate(mockContext('admin'))).toThrow(ForbiddenException);
  });
});
