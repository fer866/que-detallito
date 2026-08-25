import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupCalendar } from 'src/app/entities/calendar';
import { DeliveryTime } from '../components/catalogs/delivery-times/delivery-times';
import { ListProduct, Product } from '../components/products/product';
import { ListPromo } from '../components/promo/promo';
import { ListVariant, ProductImage, Variant } from '../components/variant/variant';

@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getCatalogs(id: number): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`production/${id}`, { headers: this.header });
  }

  addCatalog(id: number, cat: Catalog): Observable<any> {
    return this.http.put<any>('production/addCatalog', JSON.stringify({ idCatalog: id, currentCatalog: cat }), { headers: this.header });
  }

  editCatalog(id: number, cat: Catalog): Observable<any> {
    return this.http.patch<any>('production/editCatalog', JSON.stringify({ idCatalog: id, currentCatalog: cat }), { headers: this.header });
  }

  getProducts(): Observable<ListProduct[]> {
    return this.http.get<ListProduct[]>('production/getProducts', { headers: this.header });
  }

  addProduct(product: Product): Observable<any> {
    return this.http.put<any>('production/addProduct', JSON.stringify(product), { headers: this.header });
  }

  updateProduct(product: Product): Observable<any> {
    return this.http.patch<any>('production/updateProduct', JSON.stringify(product), { headers: this.header });
  }

  deleteProduct(idProduct: number): Observable<any> {
    return this.http.delete<any>(`production/deleteProduct/${idProduct}`, { headers: this.header });
  }

  getVariants(idProduct: number): Observable<ListVariant[]> {
    return this.http.get<ListVariant[]>(`production/getVariants/${idProduct}`, { headers: this.header });
  }

  addVariant(form: FormData): Observable<any> {
    return this.http.put<any>('production/addVariant', form);
  }

  updateVariant(variant: Variant): Observable<any> {
    return this.http.patch<any>('production/updateVariant', JSON.stringify(variant), { headers: this.header });
  }

  deleteVariant(idVariant: number): Observable<any> {
    return this.http.delete<any>(`production/deleteVariant/${idVariant}`, { headers: this.header });
  }

  getProductImages(idVariant: number): Observable<ProductImage[]> {
    return this.http.get<ProductImage[]>(`production/getProductImages/${idVariant}`, { headers: this.header });
  }

  addProductImage(form: FormData): Observable<any> {
    return this.http.put<any>('production/addProductImage', form);
  }

  deleteProductImage(image: ProductImage): Observable<any> {
    return this.http.post<any>('production/deleteProductImage', JSON.stringify(image), { headers: this.header });
  }

  getCalendarYears(): Observable<number[]> {
    return this.http.get<number[]>('production/getCalendarYears', { headers: this.header });
  }

  getCalendar(year: number): Observable<GroupCalendar[]> {
    return this.http.get<GroupCalendar[]>(`production/getCalendar/${year}`, { headers: this.header });
  }

  addCalendarDay(day: any): Observable<any> {
    return this.http.put<any>('production/addCalendarDay', JSON.stringify(day), { headers: this.header });
  }

  deleteCalendarDay(id: number): Observable<any> {
    return this.http.delete<any>(`production/deleteCalendarDay/${id}`, { headers: this.header });
  }

  getPromos(): Observable<ListPromo[]> {
    return this.http.get<ListPromo[]>('production/getPromos', { headers: this.header });
  }

  addPromo(form: FormData): Observable<any> {
    return this.http.put<any>('production/addPromo', form);
  }

  updatePromo(form: FormData): Observable<any> {
    return this.http.patch<any>('production/updatePromo', form);
  }

  deletePromo(id: number): Observable<any> {
    return this.http.delete<any>(`production/deletePromo/${id}`, { headers: this.header });
  }

  getDeliveryTimes(): Observable<DeliveryTime[]> {
    return this.http.get<DeliveryTime[]>('production/getDeliveryTimes', { headers: this.header });
  }

  addDeliveryTime(time: any): Observable<any> {
    return this.http.put<any>('production/addDeliveryTime', JSON.stringify(time), { headers: this.header });
  }

  updateDeliveryTime(time: any): Observable<any> {
    return this.http.patch<any>('production/updateDeliveryTime', JSON.stringify(time), { headers: this.header });
  }

  deleteDeliveryTime(id: number): Observable<any> {
    return this.http.delete<any>(`production/deleteDeliveryTime/${id}`, { headers: this.header });
  }
}

export class Catalog {
  id: number | undefined;
  name: string | undefined;
  created: string | undefined;
}
