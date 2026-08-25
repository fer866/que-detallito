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
    return this.http.post<any>('account', JSON.stringify(login), { headers: this.header });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>('account/refreshToken', null, { headers: this.header });
  }

  revokeToken(): Observable<any> {
    return this.http.post<any>('account/revokeToken', null, { headers: this.header });
  }

  register(user: any): Observable<any> {
    return this.http.post<any>('account/register', JSON.stringify(user), { headers: this.header });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post<any>('account/verifyEmail', JSON.stringify({ token: token }), { headers: this.header });
  }

  forgotPassword(user: any): Observable<any> {
    return this.http.post<any>('account/forgotPassword', JSON.stringify(user), { headers: this.header });
  }

  resetPassword(user: any): Observable<any> {
    return this.http.post<any>('account/resetPassword', JSON.stringify(user), { headers: this.header });
  }

  validateResetPassword(token: string): Observable<any> {
    return this.http.post<any>('account/verifyResetPasswordToken', JSON.stringify({ token: token }), { headers: this.header });
  }

  changePassword(change: any): Observable<any> {
    return this.http.patch('account/changePassword', JSON.stringify(change), { headers: this.header });
  }

  changeEmail(change: any): Observable<any> {
    return this.http.patch('account/changeEmail', JSON.stringify(change), { headers: this.header });
  }

  getUserData(): Observable<User> {
    return this.http.get<User>('account/getUserData', { headers: this.header });
  }

  getDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>('account/getDeliveries', { headers: this.header });
  }

  getZipCodeData(zipCode: string): Observable<any> {
    return this.http.get<any>(`account/getZipCodeData/${zipCode}`, { headers: this.header });
  }

  addDelivery(delivery: Delivery): Observable<any> {
    return this.http.post<any>('account/addDelivery', JSON.stringify(delivery), { headers: this.header });
  }

  updateDelivery(delivery: Delivery): Observable<any> {
    return this.http.patch<any>('account/updateDelivery', JSON.stringify(delivery), { headers: this.header });
  }

  deleteDelivery(idDelivery: number): Observable<any> {
    return this.http.delete<any>(`account/deleteDelivery/${idDelivery}`, { headers: this.header });
  }

  updatePersonalInfo(user: any): Observable<any> {
    return this.http.patch<any>('account/updateAccountInfo', JSON.stringify(user), { headers: this.header });
  }

  resendEmailConfirmation(email: string): Observable<any> {
    return this.http.post<any>('account/resendEmailConfirmation', JSON.stringify({ user: email }), { headers: this.header });
  }

  validateSecureCode(data: any): Observable<any> {
    return this.http.post<any>('account/validateSecureCode', JSON.stringify(data), { headers: this.header });
  }

  subscribeNewletter(data: any): Observable<any> {
    return this.http.post<any>('account/subscribeNewsletter', JSON.stringify(data), { headers: this.header });
  }

  contactUs(data: any): Observable<any> {
    return this.http.post<any>('account/contactUs', JSON.stringify(data), { headers: this.header });
  }
}
