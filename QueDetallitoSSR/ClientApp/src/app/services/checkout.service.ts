import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Discount, Order, OrderPost, OrderProducts } from '../entities/checkout';
import { CheckoutResponse } from '../entities/user';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  pay(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('apiCheckout', JSON.stringify(order), { headers: this.header });
  }

  payConfirm(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('apiCheckout/intentConfirm', JSON.stringify(order), { headers: this.header });
  }

  payOxxo(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('apiCheckout/intentOxxo', JSON.stringify(order), { headers: this.header });
  }

  createPaypalOrder(order: OrderPost): Observable<any> {
    return this.http.post<any>('apiCheckout/createPaypalOrder', JSON.stringify(order), { headers: this.header });
  }

  capturePaypalOrder(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('apiCheckout/capturePaypalOrder', JSON.stringify(order), { headers: this.header });
  }

  getDiscount(code: string): Observable<Discount> {
    return this.http.get<Discount>(`apiCheckout/getDiscount/${code}`, { headers: this.header });
  }

  getOrderById(orderYear: number, idOrder: number): Observable<Order> {
    return this.http.get<Order>(`apiCheckout/getOrderById/${orderYear}/${idOrder}`, { headers: this.header });
  }

  getOrderProducts(orderYear: number, idOrder: number): Observable<OrderProducts[]> {
    return this.http.get<OrderProducts[]>(`apiCheckout/getOrderProducts/${orderYear}/${idOrder}`, { headers: this.header });
  }

  getOrdersByPeriod(period: number): Observable<Order[]> {
    return this.http.get<Order[]>(`apiCheckout/getOrdersByPeriod/${period}`, { headers: this.header });
  }

  cancelOrder(order: any): Observable<any> {
    return this.http.post<any>('apiCheckout/cancelOrder', JSON.stringify(order), { headers: this.header });
  }
}
