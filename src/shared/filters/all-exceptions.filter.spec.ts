import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import * as Sentry from '@sentry/nestjs';
import { AppLogger } from '../observability/app-logger.service.js';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

vi.mock('@sentry/nestjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((callback: (scope: { setTag: (key: string, value: string) => void }) => void) =>
    callback({ setTag: vi.fn() }),
  ),
}));

@Controller('payments')
class PaymentsProbeController {
  @Get('unexpected')
  unexpected(): void {
    throw new Error('database exploded');
  }

  @Get(':id')
  notFound(): void {
    throw new NotFoundException('Payment not found');
  }

  @Get('gateway/down')
  serverError(): void {
    throw new InternalServerErrorException('Gateway unavailable');
  }

  @Get(':id/refund')
  refund(): void {
    throw new Error('refund failed');
  }

  @Get('reports/search')
  search(): void {
    // Exercises the non-Error branch of the filter on purpose.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw 'not an error';
  }
}

describe('AllExceptionsFilter', () => {
  let app: INestApplication<App>;
  const captureException = vi.mocked(Sentry.captureException);
  const withScope = Sentry.withScope as unknown as Mock;
  let capturedTags: Record<string, string>;

  beforeEach(async () => {
    vi.clearAllMocks();
    capturedTags = {};
    withScope.mockImplementation((callback: (scope: unknown) => void) =>
      callback({
        setTag: (key: string, value: string) => {
          capturedTags[key] = value;
        },
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsProbeController],
      providers: [AppLogger, { provide: APP_FILTER, useClass: AllExceptionsFilter }],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('reports unexpected errors to Sentry and hides the cause from the client', async () => {
    const response = await request(app.getHttpServer()).get('/payments/unexpected');

    expect(response.status).toBe(500);
    expect((response.body as { message: string }).message).toBe('An unexpected error occurred');
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('tags the event with the feature and the parameterised route', async () => {
    await request(app.getHttpServer()).get('/payments/unexpected');

    expect(capturedTags).toEqual({ feature: 'payments', op: 'GET /payments/unexpected' });
  });

  it('keeps real ids out of the op tag', async () => {
    await request(app.getHttpServer()).get('/payments/9182/refund');

    expect(capturedTags.op).toBe('GET /payments/:id/refund');
  });

  it('reports server-side HttpExceptions to Sentry', async () => {
    const response = await request(app.getHttpServer()).get('/payments/gateway/down');

    expect(response.status).toBe(500);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('keeps the query string out of the error envelope returned to the client', async () => {
    const unexpected = await request(app.getHttpServer()).get(
      '/payments/unexpected?search=52998224725',
    );
    const notFound = await request(app.getHttpServer()).get('/payments/42?cpf=52998224725');

    expect((unexpected.body as { path: string }).path).toBe('/payments/unexpected');
    expect((notFound.body as { path: string }).path).toBe('/payments/42');
  });

  it('keeps the query string out of the envelope message', async () => {
    const response = await request(app.getHttpServer()).get('/nao-existe?search=52998224725');

    expect(response.status).toBe(404);
    expect((response.body as { message: string }).message).toBe('Cannot GET /nao-existe');
  });

  it('keeps the query string out of the message sent to Sentry', async () => {
    const captureMessage = vi.mocked(Sentry.captureMessage);

    await request(app.getHttpServer()).get('/payments/reports/search?search=52998224725');

    expect(captureMessage).toHaveBeenCalledTimes(1);
    expect(captureMessage.mock.calls[0][0]).toBe(
      'GET /payments/reports/search -> Unknown exception not an error',
    );
  });

  it('does not report client errors to Sentry', async () => {
    const response = await request(app.getHttpServer()).get('/payments/42');

    expect(response.status).toBe(404);
    expect((response.body as { message: string }).message).toBe('Payment not found');
    expect(captureException).not.toHaveBeenCalled();
  });
});
