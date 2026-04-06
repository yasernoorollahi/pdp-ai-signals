import Fastify from 'fastify';
import { AppContainer } from './config/container.js';
import { registerErrorHandler } from './utils/errorHandler.js';
import { registerSwagger } from './config/swagger.js';

async function buildServer() {
  const container = new AppContainer();

  const app = Fastify({
    logger: true,
    requestTimeout: container.config.REQUEST_TIMEOUT_MS
  });

  app.addHook('onRequest', (request, reply, done) => {
    container.requestLogger.onRequest(request, reply);
    done();
  });

  app.addHook('onResponse', (request, reply, done) => {
    container.requestLogger.onResponse(request, reply);
    done();
  });

  app.addHook('onError', (request, reply, error, done) => {
    container.requestLogger.onError?.(request, reply, error);
    done();
  });

  app.get('/monitor/stream', async (request, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const sendEvent = (eventName: string, payload: unknown) => {
      reply.raw.write(`event: ${eventName}\n`);
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sendEvent('snapshot', container.liveRequestMonitor.getHistory());

    const unsubscribe = container.liveRequestMonitor.subscribe((event) => {
      sendEvent('request', event);
    });

    const heartbeat = setInterval(() => {
      reply.raw.write(': keep-alive\n\n');
    }, 15000);

    request.raw.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
      reply.raw.end();
    });

    return reply;
  });

  await registerSwagger(app, container.config.PORT);

  container.healthController.register(app);
  container.factsController.register(app);
  container.intentController.register(app);
  container.toneController.register(app);
  container.cognitiveController.register(app);
  container.contextController.register(app);
  container.topicsController.register(app);
  container.signalsController.register(app);
  container.messageClassifierController.register(app);
  container.modelsController.register(app);

  registerErrorHandler(app);

  return { app, config: container.config };
}

async function start(): Promise<void> {
  const { app, config } = await buildServer();

  try {
    await app.listen({
      host: '0.0.0.0',
      port: config.PORT
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
