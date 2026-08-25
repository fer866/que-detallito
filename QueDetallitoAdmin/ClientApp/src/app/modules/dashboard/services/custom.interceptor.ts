import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, Subject, EMPTY, throwError } from 'rxjs';
import { takeUntil, catchError, tap, switchMap, map, finalize } from "rxjs/operators";
import { BackendApiService } from './backend-api.service';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderService } from 'src/app/loader/loader.service';
import { BASE_URL } from 'src/app/app.config';

@Injectable()
export class CustomInterceptor implements HttpInterceptor, OnDestroy {
  unsubscribe$ = new Subject();
  private readonly _time: number = 7000;
  private readonly _discart: string = 'descartar';
  refreshTokenInProgress: boolean = false;
  private _tokenRefreshed = new Subject();
  tokenRefreshed = this._tokenRefreshed.asObservable();

  constructor(
    private service: BackendApiService,
    private router: Router,
    private token: TokenService,
    private snack: MatSnackBar,
    private loader: LoaderService,
    @Inject(BASE_URL) private baseUrl: string
  ) {}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private authHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.token.getToken();
    if (token) {
      return request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    return request;
  }

  private refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable(observer => {
        this.tokenRefreshed.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshTokenInProgress = true;
      return this.service.refreshToken().pipe(
        tap(t => {
          this.refreshTokenInProgress = false;
          this.token.setToken(t);
          this._tokenRefreshed.next();
        }),
        catchError(() => {
          this.refreshTokenInProgress = false;
          this.logout();
          return EMPTY;
        })
      );
    }
  }

  private logout(): void {
    this.token.logout();
    this.router.navigate(['/login']);
  }

  private handleResponseError(error: HttpErrorResponse, request?: HttpRequest<any>, next?: HttpHandler): any {
    switch (error.status) {
      case 400: //Business error
        if (error.error?.message) {
          this.snack.open(error.error.message, this._discart, { duration: this._time });
        }
        break;
      case 401: //Invalid Token error
        return this.refreshToken().pipe(
          switchMap(() => {
            if (request && next) {
              request = this.authHeader(request);
              return next.handle(request);
            }
            return EMPTY;
          }),
          catchError(e => {
            if (e.status !== 401) {
              return this.handleResponseError(e);
            } else {
              this.logout();
            }
          })
        );
      case 403: //Access denied error
        this.snack.open('No se completo la petición porque el acceso está negado', this._discart, { duration: this._time });
        this.logout();
        break;
      case 404: //Not Found
        this.snack.open(
          error.error?.message ? error.error.message : 'No fué posible realizar la solicitud',
          this._discart, { duration: this._time }
        );
        break;
      case 500: //Internal Server error
        this.snack.open(
          '¡Ops! Algo salió mal, porfavor intenta más tarde',
          this._discart, { duration: this._time }
        );
        break;
      case 503: //Maintenance error
        this.snack.open('Lamentamos el inconveniente pero estamos mejorando la página', this._discart, { duration: this._time });
        this.router.navigate(['/maintenance']);
        break;
    }
    return throwError(error);
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.authHeader(request);
    this.loader.change(true);
    request = request.clone({ url: `${this.baseUrl}${request.url}` });
    return next.handle(request).pipe(
      finalize(() => {
        this.loader.change(false);
      }),
      catchError(error => {
        return this.handleResponseError(error, request, next);
      })
    );
  }
}
