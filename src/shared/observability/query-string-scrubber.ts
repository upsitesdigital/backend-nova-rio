/**
 * Drops the query string of every URL inside a free-form text.
 *
 * `?search=` and friends carry names, e-mails and CPFs, and those texts end up
 * in stdout, in error envelopes and in Sentry. Only URL-looking tokens are
 * touched, so ordinary prose keeps its question marks.
 */
export class QueryStringScrubber {
  private constructor() {}

  static scrub(text: string): string {
    return text
      .split(' ')
      .map((token) =>
        token.includes('?') && (token.includes('/') || token.includes('://'))
          ? (token.split('?')[0] ?? token)
          : token,
      )
      .join(' ');
  }
}
