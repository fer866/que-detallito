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
    return this.http.get<CategoryProduct[]>('products', { headers: this.header });
  }

  getSeasonPromos(): Observable<Promo[]> {
    return this.http.get<Promo[]>('products/getSeasonPromos', { headers: this.header });
  }

  getPromos(): Observable<Promo[]> {
    return this.http.get<Promo[]>('products/getPromos', { headers: this.header });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`products/getProduct/${id}`, { headers: this.header });
  }

  getSearchProducts(term: string): Observable<ListProducts[]> {
    term = term.trim();
    return this.http.get<ListProducts[]>(`products/getSearchProducts/${term}`, { headers: this.header });
  }

  getDeliveryDates(nextDay: number): Observable<DeliveryDates> {
    return this.http.get<DeliveryDates>(`products/getDeliveryDates/${nextDay}`, { headers: this.header });
  }

  getHolidays(): Observable<string[]> {
    return this.http.get<string[]>('products/getHolidays', { headers: this.header });
  }

  getDeliveryTimes(date: string): Observable<DeliveryTime[]> {
    return this.http.post<DeliveryTime[]>(`products/getDeliveryTimes`, JSON.stringify({ date: date }), { headers: this.header });
  }

  addWishlistProduct(id: number): Observable<any> {
    return this.http.put<any>('products/addWishlistProduct', id, { headers: this.header });
  }

  removeWishlistProduct(id: number): Observable<any> {
    return this.http.delete<any>(`products/deleteWishProduct/${id}`, { headers: this.header });
  }

  getWishProducts(isAuth: boolean, values: number[]): Observable<ListProducts[]> {
    const url: string = isAuth ? 'getWishProducts' : 'getWishProductsAnonym';
    return this.http.post<ListProducts[]>(`products/${url}`, JSON.stringify(values), { headers: this.header });
  }

  getCartItems(isAuth: boolean, values: CartItem[]): Observable<Cart[]> {
    const url: string = isAuth ? 'getCartItems' : 'getCartItemsAnonym';
    return this.http.post<Cart[]>(`products/${url}`, JSON.stringify(values), { headers: this.header });
  }

  addCartItem(item: CartItem): Observable<any> {
    return this.http.put<any>('products/addCartItem', JSON.stringify(item), { headers: this.header });
  }

  removeCartItem(item: CartItem): Observable<any> {
    return this.http.delete<any>(`products/deleteCartItem/${item.idProduct}/${item.idVariant}`, { headers: this.header });
  }

  changeCartDateTime(item: any): Observable<any> {
    return this.http.patch<any>('products/changeCartDateTime', JSON.stringify(item), { headers: this.header });
  }

  verifyCartDateTime(deliveryDate: string, idDeliveryTime: number): Observable<CartVerification> {
    const item: any = { deliveryDate: deliveryDate, idDeliveryTime: idDeliveryTime };
    return this.http.post<CartVerification>('products/verifyCartDateTime', JSON.stringify(item), { headers: this.header });
  }

  getProductReviews(idProduct: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`products/getProductReviews/${idProduct}`, { headers: this.header });
  }
}
