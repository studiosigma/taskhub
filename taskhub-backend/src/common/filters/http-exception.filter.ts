import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // Prisma known request errors
    if (typeof exception === 'object' && exception !== null && 'code' in exception) {
      const prismaError = exception as any;
      this.logger.warn(`Prisma Error ${prismaError.code}: ${prismaError.message}`);

      switch (prismaError.code) {
        // Unique constraint violation
        case 'P2002':
          status = HttpStatus.CONFLICT;
          const target = prismaError.meta?.target || [];
          message = `${target.join(', ')} already exists`;
          break;

        // Record not found (findUnique, findFirst, update, delete)
        case 'P2001':
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;

        // Foreign key constraint violation
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;

        // Value too long for column
        case 'P2000':
          status = HttpStatus.BAD_REQUEST;
          message = 'Value is too long for the column';
          break;

        // Null constraint violation
        case 'P2011':
          status = HttpStatus.BAD_REQUEST;
          message = 'Null constraint violation';
          break;

        // Missing required value
        case 'P2012':
          status = HttpStatus.BAD_REQUEST;
          message = 'Missing required value';
          break;

        // Required relation violation
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'Required relation violation';
          break;

        // Related record not found
        case 'P2018':
          status = HttpStatus.NOT_FOUND;
          message = 'Required connected records not found';
          break;

        // Table or column does not exist
        case 'P2021':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Table does not exist';
          this.logger.error(`Table missing: ${prismaError.meta?.table || 'unknown'}`);
          break;

        case 'P2022':
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Column does not exist';
          this.logger.error(`Column missing: ${prismaError.meta?.column || 'unknown'}`);
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          message = prismaError.message || 'Database error';
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
      } else {
        message = exceptionResponse || message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
