import { Injectable, Logger } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { LogOperationParser } from './log-operation-parser.js';

interface ErrorReport {
  error?: unknown;
  feature?: string;
  op?: string;
}

/**
 * Application logger: writes through Nest's Logger and reports to Sentry with
 * `feature`/`op` tags.
 *
 * Messages should read `Feature.operation() what went wrong` so the tags come
 * for free; callers that already know their taxonomy can pass it explicitly.
 */
@Injectable()
export class AppLogger {
  private readonly logger = new Logger(AppLogger.name);

  error(message: string, report: ErrorReport = {}): void {
    const error = report.error;
    this.logger.error(message, error instanceof Error ? error.stack : undefined);

    const parsed = LogOperationParser.parse(message);
    const feature = report.feature ?? parsed?.feature;
    const op = report.op ?? parsed?.op;

    Sentry.withScope((scope) => {
      if (feature) {
        scope.setTag('feature', feature);
      }
      if (op) {
        scope.setTag('op', op);
      }

      // A non-Error value has no stack to group by, so send the message instead
      // of an "Object captured as exception" issue nobody can act on.
      if (error instanceof Error) {
        Sentry.captureException(error);
        return;
      }

      Sentry.captureMessage(message, 'error');
    });
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  info(message: string): void {
    this.logger.log(message);
  }
}
