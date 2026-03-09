import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './errors.js';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      request.log.error({ err: error, details: error.details }, 'application error');
      reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null
        }
      });
      return;
    }

    if (error instanceof ZodError) {
      request.log.error({ err: error }, 'request validation error');
      reply.status(400).send({
        error: {
          code: 'REQUEST_VALIDATION_ERROR',
          message: 'Request payload validation failed',
          details: error.format()
        }
      });
      return;
    }

    request.log.error({ err: error }, 'unhandled error');
    reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: null
      }
    });
  });
}
