import { Controller, Get, Req } from '@nestjs/common';

import { SERVICE_NAME, SERVICE_VERSION } from '../common/constants';
import type { RequestWithId } from '../common/request-context';

/**
 * Liveness/health response contract. This shape is a stable public contract —
 * it intentionally exposes no secrets, hostnames, internal config, or
 * dependency (e.g. database) state.
 */
export interface HealthResponse {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
  requestId: string;
}

@Controller({ path: 'health' })
export class HealthController {
  @Get()
  getHealth(@Req() request: RequestWithId): HealthResponse {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      timestamp: new Date().toISOString(),
      requestId: request.requestId ?? 'unknown',
    };
  }
}
