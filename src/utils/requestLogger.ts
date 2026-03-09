import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IRequestLogger } from '../interfaces/IRequestLogger.js';

declare module 'fastify' {
  interface FastifyRequest {
    receivedAtMs?: number;
  }
}

export class RequestLogger implements IRequestLogger {
  public onRequest(request: FastifyRequest, _reply: FastifyReply): void {
    request.receivedAtMs = Date.now();
    request.log.info({ method: request.method, url: request.url }, 'request received');
  }

  public onResponse(request: FastifyRequest, reply: FastifyReply): void {
    const receivedAt = request.receivedAtMs ?? Date.now();
    const durationMs = Date.now() - receivedAt;

    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs
      },
      'request completed'
    );
  }
}
