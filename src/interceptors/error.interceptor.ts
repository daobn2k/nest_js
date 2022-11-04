import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { getI18nContextFromRequest, I18nContext } from 'nestjs-i18n';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const { method, ip, path } = request;

    const now: number = Date.now();

    const i18n: I18nContext = getI18nContextFromRequest(request);

    return next.handle().pipe(
      catchError((error) => {
        const delay: number = Date.now() - now;

        let message: string | string[] =
          error?.response?.message || error?.message;

        if (error?.errors && error?.status === HttpStatus.BAD_REQUEST) {
          const nMessage: string[] = [];

          error.errors.forEach(({ constraints, children }) => {
            let rest = { ...constraints };

            if (children.length) {
              children.forEach(({ constraints: cc, children: child }) => {
                rest = { ...rest, ...cc };

                if (child.length) {
                  child.forEach(({ constraints: ccc }) => {
                    rest = { ...rest, ...ccc };
                  });
                }
              });
            }

            Object.entries(rest).forEach(([, value]) => {
              const [key, val]: string[] = (value as string).split('|');

              const args: Record<string, string> = JSON.parse(val);

              const msg: string = i18n.t(key, {
                lang: i18n.lang,
                args,
              });

              nMessage.push(msg);
            });
          });

          message = nMessage;
        }

        this.logger.error(
          `${method} ${path} ${error.status} - ${ip} +${delay}ms`,
          { message },
        );

        switch (error.status) {
          case HttpStatus.BAD_REQUEST:
            return throwError(() => new BadRequestException(message));
          case HttpStatus.FORBIDDEN:
            return throwError(() => new ForbiddenException(message));
          case HttpStatus.NOT_FOUND:
            return throwError(() => new NotFoundException(message));
          case HttpStatus.NOT_ACCEPTABLE:
            return throwError(() => new NotAcceptableException(message));
          case HttpStatus.INTERNAL_SERVER_ERROR:
            return throwError(() => new InternalServerErrorException(message));
          default:
            return throwError(() => new BadRequestException(message));
        }
      }),
    );
  }
}
