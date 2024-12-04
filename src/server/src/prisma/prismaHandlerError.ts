import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientErrorFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = HttpStatus.SERVICE_UNAVAILABLE;

    if (exception.code === 'P2002') {
      console.error(exception);
      response.status(HttpStatus.CONFLICT).json({
        err_code: 'EMAIL_ALREADY_USE',
      });
    } else {
      console.error(exception);
      response.status(status).json({
        err_code: 'DB_UNAVAILABLE',
      });
    }
  }
}
