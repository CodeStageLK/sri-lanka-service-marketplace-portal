import { getApiBaseUrl } from '@/lib/config';
import type { ApiErrorResponse } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly traceId?: string;

  constructor(status: number, message: string, traceId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.traceId = traceId;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  accessToken?: string | null;
  csrfToken?: string | null;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, accessToken, csrfToken, headers, signal, ...init } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }
  if (csrfToken) {
    requestHeaders.set('x-csrf-token', csrfToken);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  const payload = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (typeof payload === 'object' && payload !== null) {
      const error = payload as ApiErrorResponse;
      const message = Array.isArray(error.message)
        ? error.message.join(', ')
        : error.message ?? 'Request failed';
      throw new ApiError(error.statusCode ?? response.status, message, error.traceId);
    }
    throw new ApiError(response.status, typeof payload === 'string' ? payload : 'Request failed');
  }

  return payload as T;
}
