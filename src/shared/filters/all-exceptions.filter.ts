import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { AppLogger } from '../observability/app-logger.service.js';
import { HttpOperationResolver } from '../observability/http-operation-resolver.js';
import { QueryStringScrubber } from '../observability/query-string-scrubber.js';

interface ErrorEnvelope {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    this.logError(exception, request);

    if (exception instanceof HttpException) {
      this.sendHttpException(exception, request, response);
      return;
    }

    this.sendInternalError(request, response);
  }

  private sendHttpException(exception: HttpException, request: Request, response: Response): void {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const envelope: ErrorEnvelope = {
      ...this.normalizeHttpResponse(exceptionResponse, status),
      path: HttpOperationResolver.path(request),
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(envelope);
  }

  private normalizeHttpResponse(
    exceptionResponse: string | object,
    status: number,
  ): Pick<ErrorEnvelope, 'statusCode' | 'error' | 'message'> {
    if (typeof exceptionResponse === 'string') {
      return {
        statusCode: status,
        error: this.statusText(status),
        message: QueryStringScrubber.scrub(exceptionResponse),
      };
    }

    const body = exceptionResponse as Record<string, unknown>;

    return {
      statusCode: typeof body.statusCode === 'number' ? body.statusCode : status,
      error: typeof body.error === 'string' ? body.error : this.statusText(status),
      message: this.extractMessage(body, status),
    };
  }

  private extractMessage(body: Record<string, unknown>, status: number): string | string[] {
    const message = body.message;

    if (typeof message === 'string') {
      return QueryStringScrubber.scrub(message);
    }

    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.map((item) => QueryStringScrubber.scrub(item));
    }

    return this.statusText(status);
  }

  private sendInternalError(request: Request, response: Response): void {
    const envelope: ErrorEnvelope = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      path: HttpOperationResolver.path(request),
      timestamp: new Date().toISOString(),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(envelope);
  }

  private logError(exception: unknown, request: Request): void {
    const origin = `${request.method} ${HttpOperationResolver.path(request)}`;
    const operation = HttpOperationResolver.resolve(request);

    // 4xx are client mistakes, not incidents: logged locally, never sent to Sentry.
    if (exception instanceof HttpException && exception.getStatus() < 500) {
      this.logger.warn(
        `${origin} -> ${exception.getStatus()} ${QueryStringScrubber.scrub(exception.message)}`,
        exception.stack && QueryStringScrubber.scrub(exception.stack),
      );
      return;
    }

    if (this.isPrismaError(exception)) {
      // Do NOT report the Prisma error object: its message embeds query arguments (CPF, email).
      this.appLogger.error(
        `${origin} -> Prisma error ${this.prismaErrorCode(exception)} ${this.prismaErrorTarget(exception)}`.trim(),
        operation,
      );
      return;
    }

    if (exception instanceof Error) {
      this.appLogger.error(`${origin} -> ${exception.message}`, { ...operation, error: exception });
      return;
    }

    this.appLogger.error(`${origin} -> Unknown exception ${String(exception)}`, operation);
  }

  private isPrismaError(exception: unknown): exception is Error {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientValidationError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError
    );
  }

  private prismaErrorCode(exception: unknown): string {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return exception.code;
    }

    return 'unknown';
  }

  private prismaErrorTarget(exception: unknown): string {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const target = exception.meta?.target;
      if (Array.isArray(target)) {
        return `on (${target.join(', ')})`;
      }
      if (typeof target === 'string') {
        return `on (${target})`;
      }
    }

    return '';
  }

  private statusText(status: number): string {
    const known: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return known[status] ?? 'Error';
  }
}
