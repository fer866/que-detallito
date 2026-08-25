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
    return this.http.post<CheckoutResponse>('checkout', JSON.stringify(order), { headers: this.header });
  }

  payConfirm(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('checkout/intentConfirm', JSON.stringify(order), { headers: this.header });
  }

  payOxxo(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('checkout/intentOxxo', JSON.stringify(order), { headers: this.header });
  }

  createPaypalOrder(order: OrderPost): Observable<any> {
    return this.http.post<any>('checkout/createPaypalOrder', JSON.stringify(order), { headers: this.header });
  }

  capturePaypalOrder(order: OrderPost): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('checkout/capturePaypalOrder', JSON.stringify(order), { headers: this.header });
  }

  getDiscount(code: string): Observable<Discount> {
    return this.http.get<Discount>(`checkout/getDiscount/${code}`, { headers: this.header });
  }

  getOrderById(orderYear: number, idOrder: number): Observable<Order> {
    return this.http.get<Order>(`checkout/getOrderById/${orderYear}/${idOrder}`, { headers: this.header });
  }

  getOrderProducts(orderYear: number, idOrder: number): Observable<OrderProducts[]> {
    return this.http.get<OrderProducts[]>(`checkout/getOrderProducts/${orderYear}/${idOrder}`, { headers: this.header });
  }

  getOrdersByPeriod(period: number): Observable<Order[]> {
    return this.http.get<Order[]>(`checkout/getOrdersByPeriod/${period}`, { headers: this.header });
  }

  cancelOrder(order: any): Observable<any> {
    return this.http.post<any>('checkout/cancelOrder', JSON.stringify(order), { headers: this.header });
  }
}
