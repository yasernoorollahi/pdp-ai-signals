import type { FastifyRequest } from 'fastify';
import type { RequestTraceContext } from '../interfaces/RequestTraceContext.js';
import type { LiveRequestMonitor } from './liveRequestMonitor.js';

export function buildTraceContext(
  request: FastifyRequest,
  monitor: LiveRequestMonitor,
  details?: { provider?: string; model?: string }
): RequestTraceContext {
  return {
    requestId: request.id,
    ...(request.pipelineRunId ? { pipelineRunId: request.pipelineRunId } : {}),
    routeLabel: monitor.toRouteLabel(request.url),
    url: request.url,
    method: request.method,
    ...(details?.provider ? { provider: details.provider } : {}),
    ...(details?.model ? { model: details.model } : {})
  };
}

export function emitTraceStage(
  monitor: LiveRequestMonitor,
  trace: RequestTraceContext,
  stageKey: string,
  label: string,
  status: 'started' | 'completed' | 'failed',
  details?: {
    order?: number;
    durationMs?: number;
    error?: string;
    meta?: Record<string, unknown>;
  }
): void {
  monitor.emitStage({
    requestId: trace.requestId,
    ...(trace.pipelineRunId ? { pipelineRunId: trace.pipelineRunId } : {}),
    routeLabel: trace.routeLabel,
    url: trace.url,
    method: trace.method,
    stageKey,
    stageLabel: label,
    stageStatus: status,
    timestamp: new Date().toISOString(),
    ...(trace.provider ? { provider: trace.provider } : {}),
    ...(trace.model ? { model: trace.model } : {}),
    ...(typeof details?.order === 'number' ? { order: details.order } : {}),
    ...(typeof details?.durationMs === 'number' ? { durationMs: details.durationMs } : {}),
    ...(details?.error ? { error: details.error } : {}),
    ...(details?.meta ? { meta: details.meta } : {})
  });
}
