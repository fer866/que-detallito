import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly _key: string = '_tk';
  private _authenticationChanged = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticationChanged = this._authenticationChanged.asObservable();

  constructor(private storageService: LocalStorageService) { }

  isAuthenticated(): boolean {
    const token = this.storageService.getItem(this._key);
    return !(token === undefined ||
            token === null ||
            token === 'undefined' ||
            token === 'null' ||
            token === '');
  }

  getToken(): string {
    const token = this.storageService.getItem(this._key);
    if (token === undefined ||
        token === null ||
        token === 'undefined' ||
        token === 'null' ||
        token === '') {
          return '';
    }
    return token;
  }

  private setStorageToken(value: any): void {
    this.storageService.setItem(this._key, value);
    this._authenticationChanged.next(this.isAuthenticated());
  }

  setToken(data: any): void {
    this.setStorageToken(data.token);
  }

  failToken(): void {
    this.setStorageToken(undefined);
  }

  logout(): void {
    this.setStorageToken(undefined);
  }
}
