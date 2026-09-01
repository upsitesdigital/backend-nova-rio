import { LogOperation } from './log-operation.js';

/**
 * Parses the canonical `Feature.operation()` prefix out of a log message.
 *
 * `'Payments.chargeCard() gateway timed out'` yields `feature=Payments`,
 * `op=chargeCard`. Messages without the prefix are reported untagged instead of
 * being rejected: an error must never be lost because of its wording.
 */
export class LogOperationParser {
  private constructor() {}

  static parse(message: string): LogOperation | null {
    const [prefix] = message.trim().split(' ');

    if (!prefix?.endsWith('()')) {
      return null;
    }

    const [feature, operation, ...extra] = prefix.slice(0, -2).split('.');

    if (!feature || !operation || extra.length > 0) {
      return null;
    }

    return new LogOperation(feature, operation);
  }
}
