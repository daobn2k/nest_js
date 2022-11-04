import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, ip, path } = request;

    const now: number = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res: Response = context.switchToHttp().getResponse();

        const delay: number = Date.now() - now;

        this.logger.log(
          `${method} ${path} ${res.statusCode} - ${ip} +${delay}ms`,
        );
      }),
    );
  }
}
