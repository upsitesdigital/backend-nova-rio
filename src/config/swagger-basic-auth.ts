import { timingSafeEqual } from 'node:crypto';

interface SwaggerAuthRequest {
  headers: { authorization?: string };
}

interface SwaggerAuthResponse {
  setHeader: (key: string, value: string) => void;
  status: (code: number) => { end: () => void };
}

type SwaggerAuthMiddleware = (
  req: SwaggerAuthRequest,
  res: SwaggerAuthResponse,
  next: () => void,
) => void;

export class SwaggerBasicAuth {
  static create(expectedUser: string, expectedPassword: string): SwaggerAuthMiddleware {
    return (req, res, next) => {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Basic ')) {
        SwaggerBasicAuth.challenge(res);
        return;
      }
      const decoded = Buffer.from(auth.slice(6), 'base64').toString();
      const [user, pass] = decoded.split(':');
      if (
        !user ||
        !pass ||
        !SwaggerBasicAuth.safeCompare(user, expectedUser) ||
        !SwaggerBasicAuth.safeCompare(pass, expectedPassword)
      ) {
        SwaggerBasicAuth.challenge(res);
        return;
      }
      next();
    };
  }

  private static challenge(res: SwaggerAuthResponse): void {
    res.setHeader('WWW-Authenticate', 'Basic realm="Swagger"');
    res.status(401).end();
  }

  private static safeCompare(a: string, b: string): boolean {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}
