import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Cart, CartItem } from '../entities/cart';
import { LocalStorageService } from './local-storage.service';
import { ProductApiService } from './product-api.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private readonly _key: string = '_ct';
  private unsubscribe$ = new Subject();
  private _items = new BehaviorSubject<Cart[]>([]);
  
  items = this._items.asObservable();

  constructor(
    private token: TokenService,
    private service: ProductApiService,
    private storageService: LocalStorageService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCartItems(): void {
    const values = this.getLocalCartItems();
    const isAuth = this.token.isAuthenticated();
    if (!isAuth && values.length <= 0) {
      this._items.next([]);
      return;
    }
    this.service.getCartItems(isAuth, values).pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this._items.next(c);
      if (isAuth) {
        this.removeToken();
      }
    });
  }

  addProductToCart(item: CartItem): void {
    if (this.token.isAuthenticated()) {
      this.service.addCartItem(item).pipe(takeUntil(this.unsubscribe$)).subscribe(i => this.getCartItems());
    } else {
      this.addLocalCartItem(item);
      this.getCartItems();
    }
  }

  removeProductFromCart(cart: Cart): void {
    const item = {
      idProduct: cart.id,
      idVariant: cart.idVariant,
      quantity: cart.quantity,
      deliveryDate: cart.deliveryDate,
      idDeliveryTime: cart.idDeliveryTime
    } as CartItem;
    if (this.token.isAuthenticated()) {
      this.service.removeCartItem(item).pipe(takeUntil(this.unsubscribe$)).subscribe(i => this.getCartItems());
    } else {
      this.removeLocalCartItem(item);
      this.getCartItems();
    }
  }

  changeDateTime(deliveryDate: string, idDeliveryTime: number): void {
    if (this.token.isAuthenticated()) {
      const item: any = {
        deliveryDate: deliveryDate,
        idDeliveryTime: idDeliveryTime
      };
      this.service.changeCartDateTime(item).pipe(takeUntil(this.unsubscribe$)).subscribe(c => this.getCartItems());
    } else {
      let val = this.getLocalCartItems();
      val.forEach(v => {
        v.deliveryDate = deliveryDate;
        v.idDeliveryTime = idDeliveryTime
      });
      this.storageService.setItem(this._key, btoa(JSON.stringify(val)));
      this.getCartItems();
    }
  }

  private getLocalCartItems(): CartItem[] {
    const values = this.storageService.getItem(this._key);
    if (values === undefined ||
        values === null ||
        values === ''
    ) {
      return [];
    }
    return JSON.parse(atob(values));
  }

  private addLocalCartItem(item: CartItem): void {
    let values = this.getLocalCartItems();
    if (values.some(v => v.idProduct === item.idProduct && v.idVariant === item.idVariant)) {
      const idx = values.findIndex(c => c.idProduct === item.idProduct && c.idVariant === item.idVariant);
      values[idx].quantity += item.quantity;
      if (item.specialTxt) {
        values[idx].specialTxt += '+' + item.specialTxt;
      }
    } else {
      if (values.length > 0) {
        const top = values[0];
        if (new Date(top.deliveryDate) > new Date(item.deliveryDate)) {
          item.deliveryDate = top.deliveryDate;
          item.idDeliveryTime = top.idDeliveryTime;
        } else {
          values.forEach(v => {
            v.deliveryDate = item.deliveryDate;
            v.idDeliveryTime = item.idDeliveryTime;
          });
        }
      }
      values.push(item);
    }
    this.storageService.setItem(this._key, btoa(JSON.stringify(values)));
  }

  private removeLocalCartItem(item: CartItem): void {
    let values = this.getLocalCartItems();
    const idx = values.findIndex(i => i.idProduct === item.idProduct && i.idVariant === item.idVariant);
    values.splice(idx, 1);
    if (values.length > 0) {
      this.storageService.setItem(this._key, btoa(JSON.stringify(values)));
    } else {
      this.removeToken();
    }
  }

  private removeToken(): void {
    this.storageService.removeItem(this._key);
  }
}
