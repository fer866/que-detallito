import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ListUser, UserData } from '../../../entities/user';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  auth(body: any): Observable<any> {
    return this.http.post<any>('account', JSON.stringify(body), { headers: this.header });
  }

  isResetPasswordRequired(login: any): Observable<any> {
    return this.http.post<any>('account/isResetPasswordRequired', JSON.stringify(login), { headers: this.header });
  }

  updateAccountPassword(login: any): Observable<any> {
    return this.http.post<any>('account/updateAccountPassword', JSON.stringify(login), { headers: this.header });
  }

  getUserData(): Observable<UserData> {
    return this.http.get<UserData>('account/getAccountData', { headers: this.header });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>('account/refreshToken', null, { headers: this.header });
  }

  revokeToken(): Observable<any> {
    return this.http.post<any>('account/revokeToken', null, { headers: this.header });
  }

  getUsers(): Observable<ListUser[]> {
    return this.http.get<ListUser[]>('account/getAccounts', { headers: this.header });
  }

  addUser(user: any): Observable<any> {
    return this.http.put<any>('account/addAccount', JSON.stringify(user), { headers: this.header });
  }

  updateUser(user: any): Observable<any> {
    return this.http.patch<any>('account/updateAccount', JSON.stringify(user), { headers: this.header });
  }

  resetPasswordUser(reset: any): Observable<any> {
    return this.http.post<any>('account/resetAccountPassword', JSON.stringify(reset), { headers: this.header });
  }
}
