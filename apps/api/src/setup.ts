import type { INestApplication } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';

import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { requestIdMiddleware } from './common/request-id.middleware';

/**
 * Applies shared runtime configuration to a Nest application instance.
 *
 * Extracted so that `main.ts` (production bootstrap) and the test harness
 * configure the app identically:
 * - global `/api` prefix
 * - URI versioning with default version `1` (routes live under `/api/v1`)
 * - correlation-id middleware
 * - centralized exception filter
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new AllExceptionsFilter());
}
