import { z } from 'zod';

/**
 * Environment schema for the API. Validated at startup so the process fails
 * fast on invalid configuration rather than misbehaving at runtime.
 *
 * Only non-secret runtime settings are validated here. Secrets are never read
 * from source-controlled configuration.
 */
const portSchema = z.coerce.number().int().positive().max(65535);

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  API_PORT: portSchema.default(3001),
  // Optional generic PORT (e.g. some platforms inject it); API_PORT takes precedence.
  PORT: portSchema.optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * `@nestjs/config` `validate` hook. Throws (failing startup) on invalid config.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}
