import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';

import { createLogger } from './logger';
import type { JsonResponse, RequestWithId } from './request-context';

const logger = createLogger('api');

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Extracts a client-safe message from an HttpException's response payload.
 * NestJS puts either a string or a `{ message: string | string[] }` object here.
 */
function messageFromHttpException(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') {
    return response;
  }
  if (isRecord(response)) {
    const { message } = response;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join(', ');
    }
  }
  return exception.message;
}

/**
 * Structured, client-safe error envelope. Shape:
 * `{ status, message, requestId, timestamp }`.
 */
interface ErrorBody {
  status: number;
  message: string;
  requestId: string;
  timestamp: string;
}

/**
 * Global exception filter that returns a structured JSON error and never leaks
 * stack traces or internal details to clients. Full error context (including
 * the stack) is written to the server log only.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const httpCtx = host.switchToHttp();
    const response = httpCtx.getResponse<JsonResponse>();
    const request = httpCtx.getRequest<RequestWithId>();
    const requestId = request.requestId ?? 'unknown';

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // Never expose internal detail for server-side (5xx) errors in production.
    const rawMessage = isHttpException
      ? messageFromHttpException(exception)
      : 'Internal server error';
    const message =
      isProduction() && status >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : rawMessage;

    logger.error('request.error', {
      requestId,
      status,
      message: rawMessage,
      // Stack stays server-side only; it is never placed in the response body.
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const body: ErrorBody = {
      status,
      message,
      requestId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
