import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs";
import { CategoryProduct, DeliveryDates, DeliveryTime, ListProducts, Product, ProductReview, Promo } from '../entities/product';
import { Cart, CartItem, CartVerification } from '../entities/cart';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getProducts(): Observable<CategoryProduct[]> {
    return this.http.get<CategoryProduct[]>('apiProducts', { headers: this.header });
  }

  getSeasonPromos(): Observable<Promo[]> {
    return this.http.get<Promo[]>('apiProducts/getSeasonPromos', { headers: this.header });
  }

  getPromos(): Observable<Promo[]> {
    return this.http.get<Promo[]>('apiProducts/getPromos', { headers: this.header });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`apiProducts/getProduct/${id}`, { headers: this.header });
  }

  getSearchProducts(term: string): Observable<ListProducts[]> {
    term = term.trim();
    return this.http.get<ListProducts[]>(`apiProducts/getSearchProducts/${term}`, { headers: this.header });
  }

  getDeliveryDates(nextDay: number): Observable<DeliveryDates> {
    return this.http.get<DeliveryDates>(`apiProducts/getDeliveryDates/${nextDay}`, { headers: this.header });
  }

  getHolidays(): Observable<string[]> {
    return this.http.get<string[]>('apiProducts/getHolidays', { headers: this.header });
  }

  getDeliveryTimes(date: string): Observable<DeliveryTime[]> {
    return this.http.post<DeliveryTime[]>(`apiProducts/getDeliveryTimes`, JSON.stringify({ date: date }), { headers: this.header });
  }

  addWishlistProduct(id: number): Observable<any> {
    return this.http.put<any>('apiProducts/addWishlistProduct', id, { headers: this.header });
  }

  removeWishlistProduct(id: number): Observable<any> {
    return this.http.delete<any>(`apiProducts/deleteWishProduct/${id}`, { headers: this.header });
  }

  getWishProducts(isAuth: boolean, values: number[]): Observable<ListProducts[]> {
    const url: string = isAuth ? 'getWishProducts' : 'getWishProductsAnonym';
    return this.http.post<ListProducts[]>(`apiProducts/${url}`, JSON.stringify(values), { headers: this.header });
  }

  getCartItems(isAuth: boolean, values: CartItem[]): Observable<Cart[]> {
    const url: string = isAuth ? 'getCartItems' : 'getCartItemsAnonym';
    return this.http.post<Cart[]>(`apiProducts/${url}`, JSON.stringify(values), { headers: this.header });
  }

  addCartItem(item: CartItem): Observable<any> {
    return this.http.put<any>('apiProducts/addCartItem', JSON.stringify(item), { headers: this.header });
  }

  removeCartItem(item: CartItem): Observable<any> {
    return this.http.delete<any>(`apiProducts/deleteCartItem/${item.idProduct}/${item.idVariant}`, { headers: this.header });
  }

  changeCartDateTime(item: any): Observable<any> {
    return this.http.patch<any>('apiProducts/changeCartDateTime', JSON.stringify(item), { headers: this.header });
  }

  verifyCartDateTime(deliveryDate: string, idDeliveryTime: number): Observable<CartVerification> {
    const item: any = { deliveryDate: deliveryDate, idDeliveryTime: idDeliveryTime };
    return this.http.post<CartVerification>('apiProducts/verifyCartDateTime', JSON.stringify(item), { headers: this.header });
  }

  getProductReviews(idProduct: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`apiProducts/getProductReviews/${idProduct}`, { headers: this.header });
  }
}
