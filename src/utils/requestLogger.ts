import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRequestLogger } from '../interfaces/IRequestLogger.js';
import { LiveRequestMonitor } from './liveRequestMonitor.js';

declare module 'fastify' {
  interface FastifyRequest {
    receivedAtMs?: number;
    receivedAtIso?: string;
    liveMonitorError?: string;
    pipelineRunId?: string;
  }
}

export class RequestLogger implements IRequestLogger {
  constructor(private readonly liveRequestMonitor: LiveRequestMonitor) {}

  public onRequest(request: FastifyRequest, _reply: FastifyReply): void {
    request.receivedAtMs = Date.now();
    request.receivedAtIso = new Date(request.receivedAtMs).toISOString();
    const pipelineRunIdHeader = request.headers['x-pipeline-run-id'];
    if (typeof pipelineRunIdHeader === 'string' && pipelineRunIdHeader.trim().length > 0) {
      request.pipelineRunId = pipelineRunIdHeader.trim();
    }
    request.log.info({ method: request.method, url: request.url }, 'request received');
    if (shouldSkipLiveMonitoring(request.url)) {
      return;
    }
    this.liveRequestMonitor.emit({
      kind: 'request',
      requestId: request.id,
      ...(request.pipelineRunId ? { pipelineRunId: request.pipelineRunId } : {}),
      phase: 'started',
      method: request.method,
      url: request.url,
      routeLabel: this.liveRequestMonitor.toRouteLabel(request.url),
      timestamp: request.receivedAtIso,
      startedAt: request.receivedAtIso,
      source: 'api'
    });
  }

  public onResponse(request: FastifyRequest, reply: FastifyReply): void {
    const receivedAt = request.receivedAtMs ?? Date.now();
    const durationMs = Date.now() - receivedAt;
    const timestamp = new Date().toISOString();
    const phase = reply.statusCode >= 400 ? 'failed' : 'completed';

    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs
      },
      'request completed'
    );

    if (shouldSkipLiveMonitoring(request.url)) {
      return;
    }

    this.liveRequestMonitor.emit({
      kind: 'request',
      requestId: request.id,
      ...(request.pipelineRunId ? { pipelineRunId: request.pipelineRunId } : {}),
      phase,
      method: request.method,
      url: request.url,
      routeLabel: this.liveRequestMonitor.toRouteLabel(request.url),
      statusCode: reply.statusCode,
      durationMs,
      timestamp,
      startedAt: request.receivedAtIso ?? new Date(receivedAt).toISOString(),
      source: 'api',
      ...(request.liveMonitorError ? { error: request.liveMonitorError } : {})
    });
  }

  public onError(request: FastifyRequest, _reply: FastifyReply, error: Error): void {
    request.liveMonitorError = error.message;
  }
}

function shouldSkipLiveMonitoring(url: string): boolean {
  return url.startsWith('/monitor/stream');
}
