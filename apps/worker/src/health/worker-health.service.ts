import { Injectable } from '@nestjs/common';

import { SERVICE_NAME, SERVICE_VERSION } from '../common/constants';

/**
 * Internal worker health state. This is intentionally not exposed over any
 * network transport (the worker runs no HTTP server); it is a unit-testable
 * provider that a supervising process or future internal probe can consume.
 * It exposes no secrets, hostnames, or internal configuration.
 */
export interface WorkerHealth {
  status: 'ok';
  service: string;
  version: string;
}

@Injectable()
export class WorkerHealthService {
  getHealth(): WorkerHealth {
    return {
      status: 'ok',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
    };
  }
}
