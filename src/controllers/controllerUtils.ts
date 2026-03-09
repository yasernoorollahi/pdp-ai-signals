import { ExtractRequestSchema } from '../schemas/common.schema.js';
import type { ProviderOverrides } from '../config/providerFactory.js';

export type ParsedExtractBody = ReturnType<typeof parseExtractBody>;

export function parseExtractBody(body: unknown) {
  const result = ExtractRequestSchema.safeParse(body);
  if (!result.success) {
    throw result.error;
  }

  return result.data;
}

export function toProviderOverrides(body: {
  provider: 'openai' | 'ollama' | 'mock' | undefined;
  model: string | undefined;
}): ProviderOverrides {
  const overrides: ProviderOverrides = {};
  if (body.provider) {
    overrides.provider = body.provider;
  }
  if (body.model) {
    overrides.model = body.model;
  }
  return overrides;
}
