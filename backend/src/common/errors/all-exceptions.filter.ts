import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { mapException } from './map-exception';

interface RequestInfo {
  method?: string;
  url?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { status, body, unexpected } = mapException(exception);
    const context = host.switchToHttp();

    if (unexpected) {
      const request = context.getRequest<RequestInfo>();
      const error = exception instanceof Error ? exception : undefined;

      this.logger.error(
        `${request.method ?? ''} ${request.url ?? ''} failed: ${error?.message ?? String(exception)}`,
        error?.stack,
      );
    }

    this.httpAdapterHost.httpAdapter.reply(
      context.getResponse<unknown>(),
      body,
      status,
    );
  }
}
