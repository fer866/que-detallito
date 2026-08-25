import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItems } from '../components/resume/stat';
import { Delivery, ListSales, OrderProduct } from '../components/sales/sales';
import { Catalog } from './production.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getLastestSales(): Observable<ListSales[]> {
    return this.http.get<ListSales[]>('sales', { headers: this.header });
  }

  getSalesYears(): Observable<number[]> {
    return this.http.get<number[]>('sales/getSalesYears', { headers: this.header });
  }

  getSales(year: number, idStatus: number): Observable<ListSales[]> {
    return this.http.get<ListSales[]>(`sales/getSales/${year}/${idStatus}`, { headers: this.header });
  }

  getSale(id: number, year: number): Observable<ListSales> {
    return this.http.get<ListSales>(`sales/getSale/${id}/${year}`, { headers: this.header });
  }

  changeOrderStatus(change: any): Observable<any> {
    return this.http.post<any>('sales/ChangeOrderStatus', JSON.stringify(change), { headers: this.header });
  }

  getOrderProducts(id: number, year: number): Observable<OrderProduct[]> {
    return this.http.get<OrderProduct[]>(`sales/getOrderProducts/${id}/${year}`, { headers: this.header });
  }

  getDeliveryOrder(idDelivery: number): Observable<Delivery> {
    return this.http.get<Delivery>(`sales/getDeliveryOrder/${idDelivery}`, { headers: this.header });
  }

  getNextOrderStatus(id: number, year: number): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`sales/getNextOrderStatus/${id}/${year}`, { headers: this.header });
  }

  getCartItems(): Observable<CartItems[]> {
    return this.http.get<CartItems[]>('sales/getCartItems', { headers: this.header });
  }
}
