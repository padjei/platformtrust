import 'reflect-metadata';

import type { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { SERVICE_NAME, SERVICE_VERSION } from './common/constants';
import { createLogger } from './common/logger';
import { WorkerHealthService } from './health/worker-health.service';
import { WorkerModule } from './worker.module';

const logger = createLogger(SERVICE_NAME);

function registerShutdown(app: INestApplicationContext): void {
  let shuttingDown = false;

  const shutdown = (signal: NodeJS.Signals): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info('worker.shutdown', { signal });
    app
      .close()
      .then(() => {
        logger.info('worker.stopped', {});
        process.exit(0);
      })
      .catch((error: unknown) => {
        logger.error('worker.shutdown_failed', {
          message: error instanceof Error ? error.message : String(error),
        });
        process.exit(1);
      });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

async function bootstrap(): Promise<void> {
  // Standalone application context: no HTTP server is created.
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: false,
  });

  // Run module lifecycle hooks (onModuleDestroy / beforeApplicationShutdown)
  // on process termination.
  app.enableShutdownHooks();
  registerShutdown(app);

  const health = app.get(WorkerHealthService);

  logger.info('worker.started', {
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    health: health.getHealth(),
  });
}

bootstrap().catch((error: unknown) => {
  logger.error('worker.bootstrap_failed', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
