import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation';
import { WorkerHealthService } from './health/worker-health.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Fail fast on invalid environment configuration.
      validate: validateEnv,
    }),
  ],
  providers: [WorkerHealthService],
})
export class WorkerModule {}
