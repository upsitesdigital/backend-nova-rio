import type { Request } from 'express';

/**
 * Derives the `feature`/`op` tags of an HTTP request.
 *
 * `op` uses the parameterised route (`GET /payments/:id`) rather than the raw
 * URL: real ids would give every request its own tag value and blow up the
 * cardinality Sentry indexes. `feature` is the first path segment, which maps
 * one-to-one onto this API's modules.
 */
export class HttpOperationResolver {
  private constructor() {}

  /**
   * Request path without its query string: `?search=` carries names, e-mails
   * and CPFs, which must never reach a log, an error envelope or Sentry.
   */
  static path(request: Request): string {
    const [path] = request.url.split('?');

    return path ?? '';
  }

  static resolve(request: Request): { feature: string; op: string } {
    const matched = request.route as { path?: string } | undefined;
    const route = matched?.path ?? HttpOperationResolver.path(request);
    const [feature] = route.split('/').filter((segment) => segment.length > 0);

    return {
      feature: feature ?? 'unknown',
      op: `${request.method} ${route}`,
    };
  }
}
