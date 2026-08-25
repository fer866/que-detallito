import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { Delivery, User } from '../entities/user';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  auth(login: any): Observable<any> {
    return this.http.post<any>('apiAccount', JSON.stringify(login), { headers: this.header });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>('apiAccount/refreshToken', null, { headers: this.header });
  }

  revokeToken(): Observable<any> {
    return this.http.post<any>('apiAccount/revokeToken', null, { headers: this.header });
  }

  register(user: any): Observable<any> {
    return this.http.post<any>('apiAccount/register', JSON.stringify(user), { headers: this.header });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post<any>('apiAccount/verifyEmail', JSON.stringify({ token: token }), { headers: this.header });
  }

  forgotPassword(user: any): Observable<any> {
    return this.http.post<any>('apiAccount/forgotPassword', JSON.stringify(user), { headers: this.header });
  }

  resetPassword(user: any): Observable<any> {
    return this.http.post<any>('apiAccount/resetPassword', JSON.stringify(user), { headers: this.header });
  }

  validateResetPassword(token: string): Observable<any> {
    return this.http.post<any>('apiAccount/verifyResetPasswordToken', JSON.stringify({ token: token }), { headers: this.header });
  }

  changePassword(change: any): Observable<any> {
    return this.http.patch('apiAccount/changePassword', JSON.stringify(change), { headers: this.header });
  }

  changeEmail(change: any): Observable<any> {
    return this.http.patch('apiAccount/changeEmail', JSON.stringify(change), { headers: this.header });
  }

  getUserData(): Observable<User> {
    return this.http.get<User>('apiAccount/getUserData', { headers: this.header });
  }

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>('apiAccount/getDeliveries', { headers: this.header });
  }

  getZipCodeData(zipCode: string): Observable<any> {
    return this.http.get<any>(`apiAccount/getZipCodeData/${zipCode}`, { headers: this.header });
  }

  addDelivery(delivery: Delivery): Observable<any> {
    return this.http.post<any>('apiAccount/addDelivery', JSON.stringify(delivery), { headers: this.header });
  }

  updateDelivery(delivery: Delivery): Observable<any> {
    return this.http.patch<any>('apiAccount/updateDelivery', JSON.stringify(delivery), { headers: this.header });
  }

  deleteDelivery(idDelivery: number): Observable<any> {
    return this.http.delete<any>(`apiAccount/deleteDelivery/${idDelivery}`, { headers: this.header });
  }

  updatePersonalInfo(user: any): Observable<any> {
    return this.http.patch<any>('apiAccount/updateAccountInfo', JSON.stringify(user), { headers: this.header });
  }

  resendEmailConfirmation(email: string): Observable<any> {
    return this.http.post<any>('apiAccount/resendEmailConfirmation', JSON.stringify({ user: email }), { headers: this.header });
  }
}
