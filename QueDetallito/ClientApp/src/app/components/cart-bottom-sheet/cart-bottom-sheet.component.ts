import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Cart } from 'src/app/entities/cart';
import { Product } from 'src/app/entities/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductApiService } from 'src/app/services/product-api.service';

@Component({
  selector: 'app-cart-bottom-sheet',
  templateUrl: './cart-bottom-sheet.component.html',
  styleUrls: ['./cart-bottom-sheet.component.scss']
})
export class CartBottomSheetComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  listItems: Observable<Cart[]> = EMPTY;
  subtotal: Observable<number> = EMPTY;

  constructor(
    private cartService: CartService,
    private bottomSheetRef: MatBottomSheetRef<CartBottomSheetComponent>,
    private service: ProductApiService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.listItems = this.cartService.items;
    this.subtotal = this.cartService.items.pipe(map(i => {
      return i.map(v => v).reduce((prev, curr) => prev + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0);
    }));
  }

  removeProductOfCart(cart: Cart): void {
    this.cartService.removeProductFromCart(cart);
  }

  goToProduct(product: Product): void {
    this.bottomSheetRef.dismiss({ url: '/product', params: product.id });
  }

  goToRoute(url: string): void {
    this.bottomSheetRef.dismiss({ url: url });
  }

  goToCheckout(): void {
    this.listItems.pipe(takeUntil(this.unsubscribe$)).subscribe(i => {
      if (i.length > 0) {
        this.service.verifyCartDateTime(i[0].deliveryDate || '', i[0].idDeliveryTime || 0).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(v => this.bottomSheetRef.dismiss({ url: '/user/checkout' }));
      }
    });
  }

}
