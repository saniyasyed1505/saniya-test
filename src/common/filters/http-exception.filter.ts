import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        const payload = resContent as any;
        message = payload.message || payload.error || message;
        error = payload.error || exception.name || error;
      } else {
        message = typeof resContent === 'string' ? resContent : message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Join validation messages array into a single readable string if applicable
    const formattedMessage = Array.isArray(message) ? message.join(', ') : message;

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} failed with status ${status} - Error: ${error} - Message: ${formattedMessage}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json({
      success: false,
      message: formattedMessage,
      error,
    });
  }
}
