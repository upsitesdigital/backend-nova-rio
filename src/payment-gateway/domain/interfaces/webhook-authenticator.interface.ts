export interface IWebhookAuthenticator {
  /**
   * Valida o header HTTP `Authorization` enviado pela Vindi nos webhooks.
   * A Vindi autentica webhooks via HTTP Basic Auth (RFC 2617), não por assinatura.
   */
  authenticate(authorizationHeader: string | undefined): boolean;
}
