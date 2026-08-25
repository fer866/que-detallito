import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { combineLatest, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { Cart } from 'src/app/entities/cart';
import { DateTimePickerComponent } from 'src/app/modules/date-time-picker/date-time-picker.component';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ProductApiService } from 'src/app/services/product-api.service';
import { Discount, Font, ListFonts } from "../../../../entities/checkout";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  listFonts: Font[] = ListFonts;
  messageForm = new FormGroup({
    font: new FormControl('', [Validators.required]),
    note: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(400)]),
    sender: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)])
  });
  deliveryForm = new FormGroup({
    idDelivery: new FormControl(null, Validators.required)
  });
  idOrder: number = 0;
  dataSource: MatTableDataSource<Cart> = new MatTableDataSource();
  deliveryDate: Observable<string> = EMPTY;
  deliveryTime: Observable<string> = EMPTY;
  displayCols: string[] = ['url','name','price','quantity','total'];
  mobile: Observable<boolean> = EMPTY;
  couponForm = new FormGroup({
    discountCode: new FormControl('', [Validators.required, Validators.maxLength(15)])
  });
  discount?: Discount;
  subtotal: Observable<number> = EMPTY;
  total: Observable<number> = EMPTY;
  deliveryCost: number = 99;
  minutesLeft?: number;
  interval: any;
  noMessage: boolean = false;
  noSender: boolean = false;

  constructor(
    private service: CheckoutService,
    private cartService: CartService,
    private breakpoint: BreakpointObserver,
    private title: Title,
    private dialog: MatDialog,
    private productService: ProductApiService,
    private snack: MatSnackBar,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.mobile = this.breakpoint.observe('(max-width: 992px)').pipe(map(m => m.matches), shareReplay());
    this.title.setTitle('Que Detallito | Pago');
    this.cartService.items.pipe(takeUntil(this.unsubscribe$)).subscribe(i => {
      if (i.length <= 0) {
        // this.router.navigate(['page-not-found']);
        return;
      }
      this.dataSource = new MatTableDataSource(i);
      if (i.some(o => o.specialTxt)) {
        if (!this.displayCols.includes('specialTxt')) {
          this.displayCols.splice(4, 0, 'specialTxt');
        }
      } else if (this.displayCols.includes('specialTxt')) {
        this.displayCols.splice(4, 1);
      }
      this.verifyDateTime(i[0]);
    });
    this.deliveryDate = this.cartService.items.pipe(filter(c => c.length > 0), map(c => c[0].deliveryDate || ''));
    this.deliveryTime = this.cartService.items.pipe(filter(c => c.length > 0), map(c => c[0].deliveryTime || ''));
    this.subtotal = this.cartService.items.pipe(
      map(c => c.reduce((prev, curr) => prev + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0))
    );
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.total = this.cartService.items.pipe(
      map(c => {
        const total = c.reduce((prev, curr) => prev + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0);
        return (total + this.deliveryCost) * (1 - ((this.discount?.discount || 0) / 100));
      })
    );
  }

  verifyDateTime(c: Cart): void {
    this.productService.verifyCartDateTime(c.deliveryDate || '', c.idDeliveryTime || 0).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(v => {
      if (v.minutesLeft) {
        this.minutesLeft = v.minutesLeft;
        this.interval = setInterval(() => {
          if (this.minutesLeft) {
            this.minutesLeft -= 1;
          } else {
            clearInterval(this.interval);
            this.snack.open('La hora ya no es válida, selecciona un nuevo horario de entrega', 'descartar');
          }
        }, 60000);
      }
    })
  }

  onAddressSelected(val: number | undefined): void {
    this.deliveryForm.patchValue({ idDelivery: val });
  }

  applyCoupon(): void {
    const code = this.couponForm.value.discountCode;
    this.couponForm.disable();
    this.service.getDiscount(code).pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
      this.discount = d;
      this.calculateTotal();
    }, error => {
      this.couponForm.enable();
      this.couponForm.reset();
      this.calculateTotal();
    });
  }

  removeCoupon(): void {
    this.couponForm.enable();
    this.couponForm.reset();
    this.discount = undefined;
    this.calculateTotal();
  }

  changeCartDateTime(): void {
    this.dialog.open(DateTimePickerComponent, { disableClose: true });
  }

  changeNoMessage(checked: boolean): void {
    if (checked) {
      this.messageForm.controls.font.disable();
      this.messageForm.controls.note.disable();
      this.messageForm.controls.font.reset();
      this.messageForm.controls.note.reset();
    } else {
      this.messageForm.controls.font.enable();
      this.messageForm.controls.note.enable();
    }
  }

  changeNoSender(checked: boolean): void {
    if (checked) {
      this.messageForm.controls.sender.disable();
      this.messageForm.controls.sender.reset();
    } else {
      this.messageForm.controls.sender.enable();
    }
  }

}
