import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { ListProducts } from '../entities/product';
import { LocalStorageService } from './local-storage.service';
import { ProductApiService } from './product-api.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService implements OnDestroy {
  private unsubscribe$ = new Subject();
  private readonly _key: string = '_wl';
  private _products = new BehaviorSubject<ListProducts[]>([]);

  products = this._products.asObservable();

  constructor(
    private token: TokenService,
    private service: ProductApiService,
    private storageService: LocalStorageService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  addWishlistProduct(id: number): void {
    if (this.token.isAuthenticated()) {
      this.service.addWishlistProduct(id).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.getWishProducts());
    } else {
      this.addLocalWishProduct(id);
      this.getWishProducts();
    }
  }

  removeWishlistProduct(id: number): void {
    if (this.token.isAuthenticated()) {
      this.service.removeWishlistProduct(id).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.getWishProducts());
    } else {
      this.removeLocalWishProduct(id);
      this.getWishProducts();
    }
  }

  getWishProducts(): void {
    const values = this.getLocalWishIds();
    const isAuth = this.token.isAuthenticated();
    if (!isAuth && values.length <= 0) {
      this._products.next([]);
      return;
    }
    this.service.getWishProducts(isAuth, values).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this._products.next(p);
      if (isAuth) {
        this.removeToken();
      }
    });
  }

  private getLocalWishIds(): number[] {
    const values = this.storageService.getItem(this._key);
    if (values === null ||
        values === undefined ||
        values === ''
    ) {
      return [];
    }
    return JSON.parse(atob(values));
  }

  private addLocalWishProduct(id: number): void {
    let values = this.getLocalWishIds();
    values.push(id);
    this.storageService.setItem(this._key, btoa(JSON.stringify(values)));
  }

  private removeLocalWishProduct(id: number): void {
    let values = this.getLocalWishIds();
    values.splice(values.indexOf(id), 1);
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
