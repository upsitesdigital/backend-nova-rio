export interface IProcessedWebhookEventRepository {
  registerEventOnce(eventId: string, provider: string): Promise<boolean>;
}
