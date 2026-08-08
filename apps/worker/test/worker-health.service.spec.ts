import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

import { WorkerHealthService } from '../src/health/worker-health.service';

describe('WorkerHealthService', () => {
  it('returns the expected health shape and worker service name (direct)', () => {
    const service = new WorkerHealthService();

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'platformtrust-worker',
      version: '0.1.0',
    });
  });

  it('resolves via Nest dependency injection and returns the same shape', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [WorkerHealthService],
    }).compile();

    const service = moduleRef.get(WorkerHealthService);

    expect(service.getHealth()).toEqual({
      status: 'ok',
      service: 'platformtrust-worker',
      version: '0.1.0',
    });

    await moduleRef.close();
  });
});
