import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

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
      path: request.url,
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
        message: exceptionResponse,
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
      return message;
    }

    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message;
    }

    return this.statusText(status);
  }

  private sendInternalError(request: Request, response: Response): void {
    const envelope: ErrorEnvelope = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(envelope);
  }

  private logError(exception: unknown, request: Request): void {
    const origin = `${request.method} ${request.url}`;

    if (exception instanceof HttpException) {
      this.logger.warn(
        `${origin} -> ${exception.getStatus()} ${exception.message}`,
        exception.stack,
      );
      return;
    }

    if (this.isPrismaError(exception)) {
      // Do NOT log the Prisma stack/message: it embeds query arguments (CPF, email, etc.).
      this.logger.error(
        `${origin} -> Prisma error ${this.prismaErrorCode(exception)} ${this.prismaErrorTarget(exception)}`.trim(),
      );
      return;
    }

    if (exception instanceof Error) {
      this.logger.error(`${origin} -> ${exception.message}`, exception.stack);
      return;
    }

    this.logger.error(`${origin} -> Unknown exception`, String(exception));
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
