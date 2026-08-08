import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns 200 with the exact health shape', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'platformtrust-api',
      version: '0.1.0',
    });
    expect(typeof response.body.timestamp).toBe('string');
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    expect(typeof response.body.requestId).toBe('string');
    expect(response.body.requestId.length).toBeGreaterThan(0);

    // Must not leak internal details.
    expect(response.body).not.toHaveProperty('stack');
    expect(response.body).not.toHaveProperty('host');
    expect(response.body).not.toHaveProperty('database');
  });

  it('echoes a provided x-request-id in header and body', async () => {
    const provided = 'test-correlation-id-123';
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-request-id', provided);

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe(provided);
    expect(response.body.requestId).toBe(provided);
  });

  it('generates a request id when none is provided', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health');

    expect(response.status).toBe(200);
    const generatedId = response.headers['x-request-id'];
    expect(generatedId).toBeDefined();
    expect((generatedId as string).length).toBeGreaterThan(0);
    expect(response.body.requestId).toBe(generatedId);
  });
});
