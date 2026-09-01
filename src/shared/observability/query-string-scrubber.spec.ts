import { QueryStringScrubber } from './query-string-scrubber.js';

describe('QueryStringScrubber', () => {
  it('drops the query string of a path', () => {
    expect(QueryStringScrubber.scrub('Cannot GET /clients?search=52998224725')).toBe(
      'Cannot GET /clients',
    );
  });

  it('drops the query string of an absolute URL', () => {
    expect(QueryStringScrubber.scrub('POST https://api.novario.com.br/clients?cpf=529')).toBe(
      'POST https://api.novario.com.br/clients',
    );
  });

  it('drops the query string of a URL embedded in a JSON payload', () => {
    expect(QueryStringScrubber.scrub('{"path":"/clients?search=529"}')).toBe('{"path":"/clients');
  });

  it('leaves ordinary words with a question mark alone', () => {
    expect(QueryStringScrubber.scrub('quem? ninguem')).toBe('quem? ninguem');
  });
});
