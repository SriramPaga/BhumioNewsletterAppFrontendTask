import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(
    'ExceptionsHandler',
  );

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const request = ctx.getRequest();
    const path =
      httpAdapter.getRequestUrl(request);

    let message = 'Internal Server Error';
    let errorType = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      const resp = exception.getResponse();
      message =
        typeof resp === 'string'
          ? resp
          : (resp as any).message ||
            JSON.stringify(resp);
      errorType = 'API_ERROR';
    } else {
      this.logger.error(
        `Unhandled Exception at ${path}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: path,
      message: message,
      error: errorType,
    };

    httpAdapter.reply(
      ctx.getResponse(),
      responseBody,
      httpStatus,
    );
  }
}
