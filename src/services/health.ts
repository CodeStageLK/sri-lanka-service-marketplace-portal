import { z } from 'zod';
import { getApiBaseUrl } from '@/lib/config';

const healthSchema = z.object({ status: z.literal('ok') });

export async function getHealth(signal?: AbortSignal): Promise<z.infer<typeof healthSchema>> {
  const response = await fetch(`${getApiBaseUrl()}/health`, { signal });
  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }
  return healthSchema.parse(await response.json());
}
