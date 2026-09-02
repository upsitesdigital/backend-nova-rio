import type { ErrorEvent, Log } from '@sentry/nestjs';
import { SentryEventSanitizer } from './sentry-event-sanitizer.js';

describe('SentryEventSanitizer', () => {
  it('drops credentials, body and query string from the request', () => {
    const event = {
      request: {
        url: 'https://api.novario.com.br/clients?cpf=52998224725',
        headers: { Authorization: 'Bearer secret', Cookie: 'session=abc', 'x-trace': 'keep-me' },
        cookies: { session: 'abc' },
        query_string: 'cpf=52998224725',
        data: { password: 'hunter2' },
      },
    } as unknown as ErrorEvent;

    const sanitized = SentryEventSanitizer.sanitize(event);

    expect(sanitized.request?.url).toBe('https://api.novario.com.br/clients');
    expect(sanitized.request?.headers).toEqual({ 'x-trace': 'keep-me' });
    expect(sanitized.request?.cookies).toBeUndefined();
    expect(sanitized.request?.query_string).toBeUndefined();
    expect(sanitized.request?.data).toBeUndefined();
  });

  it('leaves an event without request data untouched', () => {
    const event = { message: 'worker crashed' } as ErrorEvent;

    expect(SentryEventSanitizer.sanitize(event)).toBe(event);
  });

  it('drops the query string from the event message', () => {
    const event = {
      message: 'GET /clients?search=52998224725 -> Prisma error P2002',
    } as ErrorEvent;

    expect(SentryEventSanitizer.sanitize(event).message).toBe('GET /clients -> Prisma error P2002');
  });

  it('drops the query string from a log message and its attributes', () => {
    const log = {
      level: 'error',
      message: 'GET /clients?search=joao@example.com -> boom',
      attributes: { 'sentry.message.parameter.0': 'at GET /clients?search=joao@example.com' },
    } as unknown as Log;

    const sanitized = SentryEventSanitizer.sanitizeLog(log);

    expect(sanitized.message).toBe('GET /clients -> boom');
    expect(sanitized.attributes?.['sentry.message.parameter.0']).toBe('at GET /clients');
  });

  it('leaves ordinary words with a question mark alone', () => {
    expect(SentryEventSanitizer.sanitizeText('who? nobody')).toBe('who? nobody');
  });

  it('drops the query string of a URL embedded in a JSON payload', () => {
    const payload = '{"path":"/clients?search=52998224725&cpf=52998224725"}';

    expect(SentryEventSanitizer.sanitizeText(payload)).toBe('{"path":"/clients');
  });

  it('drops the query string from exception messages', () => {
    const event = {
      exception: { values: [{ value: 'Request failed: GET /clients?search=52998224725' }] },
    } as unknown as ErrorEvent;

    expect(SentryEventSanitizer.sanitize(event).exception?.values?.[0]?.value).toBe(
      'Request failed: GET /clients',
    );
  });

  it('drops the query string from console breadcrumb arguments', () => {
    const event = {
      breadcrumbs: [
        {
          category: 'console',
          message: 'boom /clients?search=52998224725',
          data: { arguments: ['boom /clients?search=52998224725'] },
        },
      ],
    } as unknown as ErrorEvent;

    const [breadcrumb] = SentryEventSanitizer.sanitize(event).breadcrumbs ?? [];

    expect(breadcrumb?.message).toBe('boom /clients');
    expect(breadcrumb?.data?.arguments).toEqual(['boom /clients']);
  });
});
