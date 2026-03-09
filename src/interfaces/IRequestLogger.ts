import type { FastifyRequest, FastifyReply } from 'fastify';

export interface IRequestLogger {
  onRequest(request: FastifyRequest, reply: FastifyReply): void;
  onResponse(request: FastifyRequest, reply: FastifyReply): void;
}
