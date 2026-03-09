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
