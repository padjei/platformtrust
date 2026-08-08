import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { SERVICE_NAME, SERVICE_VERSION } from './common/constants';
import { createLogger } from './common/logger';
import { AppModule } from './app.module';
import { configureApp } from './setup';

const logger = createLogger(SERVICE_NAME);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Suppress Nest's own logger output; we emit structured JSON ourselves.
    logger: false,
  });

  configureApp(app);

  // Graceful shutdown: run module lifecycle hooks on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const config = app.get(ConfigService);
  // Config is validated at startup, so these always resolve; defaults are a
  // belt-and-braces fallback that also satisfies the non-inferred return type.
  const port = config.get<number>('API_PORT', 3001);
  const nodeEnv = config.get<string>('NODE_ENV', 'development');

  await app.listen(port);

  logger.info('api.started', {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    port,
    nodeEnv,
  });
}

bootstrap().catch((error: unknown) => {
  logger.error('api.bootstrap_failed', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
