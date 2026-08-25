import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Cart, CartVerification } from 'src/app/entities/cart';
import { CartService } from 'src/app/services/cart.service';
import { ProductApiService } from 'src/app/services/product-api.service';
import { DateTimePickerComponent } from '../date-time-picker/date-time-picker.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  mobile: Observable<boolean> = EMPTY;
  dataSource: MatTableDataSource<Cart> = new MatTableDataSource();
  displayCols: string[] = ['url', 'name', 'price', 'quantity', 'total', 'delete'];
  subtotal: Observable<number> = EMPTY;
  total: Observable<number> = EMPTY;
  discount: Observable<number> = EMPTY;
  minutesLeft?: number;
  interval: any;

  constructor(
    private title: Title,
    private cartService: CartService,
    private breakpoint: BreakpointObserver,
    private dialog: MatDialog,
    private service: ProductApiService,
    private router: Router,
    private snack: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.mobile = this.breakpoint.observe('(max-width: 600px)').pipe(map(b => b.matches), shareReplay(1));
    this.title.setTitle('Que Detallito | carrito');
    this.cartService.items.pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.dataSource = new MatTableDataSource(c);
      if (c.length <= 0) {
        return;
      }
      if (c.some(o => o.specialTxt)) {
        if (!this.displayCols.includes('specialTxt')) {
          this.displayCols.splice(4, 0, 'specialTxt');
        }
      } else if (this.displayCols.includes('specialTxt')) {
        this.displayCols.splice(4, 1);
      }
      this.verifyDateTime(c);
    });
    this.subtotal = this.cartService.items.pipe(
      map(c => c.map(v => v).reduce((prev, curr) => prev + ((curr.price || 0) * (curr.quantity || 0)), 0))
    );
    this.total = this.cartService.items.pipe(
      map(c => c.map(v => v).reduce((prev, curr) => prev + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0))
    );
    this.discount = combineLatest([this.subtotal, this.total]).pipe(map(([sub, tot]) => tot - sub), shareReplay(1));
  }

  verifyDateTime(c: Cart[]): void {
    this.service.verifyCartDateTime(c[0].deliveryDate || '', c[0].idDeliveryTime || 0).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(v => {
      if (v.minutesLeft) {
        this.minutesLeft = v.minutesLeft;
        this.interval = setInterval(() => {
          this.minutesLeft = (this.minutesLeft || 0) - 1;
          if (this.minutesLeft <= 0) {
            clearInterval(this.interval);
            this.snack.open('La hora ya no es válida, selecciona un nuevo horario de entrega', 'descartar');
          }
        }, 60000);
      }
    });
  }

  deleteProduct(cart: Cart): void {
    const confirm = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogData('Confirmar', `¿Quieres eliminar ${cart.name} de tu carrito?`)
    });
    confirm.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((c: ConfirmDialogData) => {
      if (c.action === 'confirm') {
        this.cartService.removeProductFromCart(cart);
      }
    });
  }

  changeCartDateTime(): void {
    this.dialog.open(DateTimePickerComponent, { disableClose: true });
  }

  goToCheckout(): void {
    const val = this.dataSource.data[0];
    this.service.verifyCartDateTime(val.deliveryDate || '', val.idDeliveryTime || 0).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(v => {
      this.router.navigate(['/user/checkout']);
    });
  }

}
