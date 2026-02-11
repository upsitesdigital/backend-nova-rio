export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: number;
  email: string;
  type: 'client' | 'admin';
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(payload: TokenPayload): Promise<TokenPair>;
  verifyRefreshToken(token: string): Promise<TokenPayload>;
}
