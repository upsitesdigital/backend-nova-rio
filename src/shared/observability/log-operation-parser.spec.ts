import { LogOperationParser } from './log-operation-parser.js';

describe('LogOperationParser', () => {
  it('extracts the feature and the operation from the canonical prefix', () => {
    const operation = LogOperationParser.parse('Payments.chargeCard() gateway timed out');

    expect(operation?.feature).toBe('Payments');
    expect(operation?.op).toBe('chargeCard');
  });

  it('returns null when the message has no operation prefix', () => {
    expect(LogOperationParser.parse('gateway timed out')).toBeNull();
  });

  it('returns null for a prefix that is not Feature.operation()', () => {
    expect(LogOperationParser.parse('Payments() failed')).toBeNull();
    expect(LogOperationParser.parse('Payments.charge.card() failed')).toBeNull();
  });
});
