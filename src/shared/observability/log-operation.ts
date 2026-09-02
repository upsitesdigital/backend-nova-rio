/**
 * Feature/operation pair extracted from a log message.
 *
 * Mirrors the taxonomy used by the Flutter app: every reported error carries a
 * `feature` and an `op` tag, so Sentry can group and chart by product area.
 */
export class LogOperation {
  constructor(
    readonly feature: string,
    readonly op: string,
  ) {}
}
