import type { FastifyRequest } from 'fastify';
import { ExtractRequestSchema } from '../schemas/common.schema.js';
import type { ProviderOverrides } from '../config/providerFactory.js';
import type { LiveRequestMonitor } from '../utils/liveRequestMonitor.js';
import { buildTraceContext, emitTraceStage } from '../utils/requestTracing.js';

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

export function traceExtractionRequest(
  request: FastifyRequest,
  liveRequestMonitor: LiveRequestMonitor,
  body: { provider: string | undefined; model: string | undefined }
) {
  const trace = buildTraceContext(request, liveRequestMonitor, {
    ...(body.provider ? { provider: body.provider } : {}),
    ...(body.model ? { model: body.model } : {})
  });

  emitTraceStage(liveRequestMonitor, trace, 'request-validated', 'Request Validated', 'completed', {
    order: 0,
    meta: {
      provider: body.provider ?? 'default',
      model: body.model ?? 'default'
    }
  });

  emitTraceStage(liveRequestMonitor, trace, 'service-ready', 'Service Ready', 'completed', {
    order: 1,
    meta: {
      provider: body.provider ?? 'default',
      model: body.model ?? 'default'
    }
  });

  return trace;
}
