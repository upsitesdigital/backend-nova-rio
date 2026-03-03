import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { type Mock, vi } from 'vitest';
import { VindiHttpClient } from './vindi-http.client.js';

describe('VindiHttpClient', () => {
  let client: VindiHttpClient;
  let fetchMock: Mock;

  const configValues: Record<string, string> = {
    VINDI_API_KEY: 'test-api-key',
    VINDI_API_URL: 'https://sandbox-app.vindi.com.br/api/v1',
  };

  beforeEach(async () => {
    fetchMock = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VindiHttpClient,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: vi.fn((key: string) => {
              const value = configValues[key];
              if (!value) throw new Error(`Missing ${key}`);
              return value;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<VindiHttpClient>(VindiHttpClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(client).toBeDefined();
  });

  it('should send GET request with correct headers', async () => {
    const responseData = { customer: { id: 1, name: 'Test' } };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(responseData),
    });

    const result = await client.sendRequest<unknown>('/customers/1', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://sandbox-app.vindi.com.br/api/v1/customers/1',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from('test-api-key:').toString('base64')}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: undefined,
      }),
    );
    expect(result).toEqual(responseData);
  });

  it('should send POST request with body', async () => {
    const requestBody = { name: 'Test Customer' };
    const responseData = { customer: { id: 1, name: 'Test Customer' } };
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue(responseData),
    });

    const result = await client.sendRequest<unknown>('/customers', {
      method: 'POST',
      body: requestBody,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestBody),
      }),
    );
    expect(result).toEqual(responseData);
  });

  it('should return undefined for DELETE with 204 status', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result = await client.sendRequest('/bills/1', { method: 'DELETE' });

    expect(result).toBeUndefined();
  });

  it('should throw error when response is not ok', async () => {
    const errorData = { errors: [{ message: 'Not found' }] };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue(errorData),
    });

    await expect(client.sendRequest('/customers/999', { method: 'GET' })).rejects.toThrow(
      'Vindi API error: 404',
    );
  });
});
