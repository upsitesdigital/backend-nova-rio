export interface IWebhookSignatureVerifier {
  verifySignature(rawBody: Buffer | string, signature: string | undefined): boolean;
  computePayloadHash(payload: unknown): string;
}
