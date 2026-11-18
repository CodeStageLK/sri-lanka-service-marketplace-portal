import { afterEach, describe, expect, it, vi } from 'vitest';
import { getHealth } from './health';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('health API client', () => {
  it('uses the configured API base and validates the response', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://example.test/api/v1/');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);
    await expect(getHealth()).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith('http://example.test/api/v1/health', { signal: undefined });
  });

  it('rejects an invalid API base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'not-a-url');
    await expect(getHealth()).rejects.toThrow('VITE_API_BASE_URL');
  });
});
