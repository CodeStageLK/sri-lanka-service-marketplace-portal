import { z } from 'zod';

const apiBaseUrlSchema = z.string().url().pipe(z.string().refine(
  (value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.search && !url.hash;
  },
  { message: 'API base URL must be an HTTP(S) URL without a query or fragment' },
));

export function getApiBaseUrl(): string {
  const parsed = apiBaseUrlSchema.safeParse(import.meta.env.VITE_API_BASE_URL);
  if (!parsed.success) {
    throw new Error('VITE_API_BASE_URL must be set to a valid HTTP(S) API URL.');
  }
  return parsed.data.replace(/\/+$/, '');
}
