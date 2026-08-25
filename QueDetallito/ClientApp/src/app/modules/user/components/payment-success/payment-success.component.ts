import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Order, OrderProducts } from 'src/app/entities/checkout';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  tablet: Observable<boolean> = EMPTY;
  dataSource: MatTableDataSource<OrderProducts> = new MatTableDataSource();
  displayCols: string[] = ['url','name','price','quantity','total'];
  order: Observable<Order> = EMPTY;
  subtotal: number = 0;
  edit: boolean = false;

  constructor(
    private service: CheckoutService,
    private breakpoint: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Que Detallito | Pedido');
    this.tablet = this.breakpoint.observe('(max-width: 992px)').pipe(map(o => o.matches), shareReplay(1));

    this.order = this.route.paramMap.pipe(
      switchMap(p => {
        if (p.has('year') && p.has('id')) {
          const year = Number(p.get('year'));
          const id = Number(p.get('id'));
          return this.service.getOrderById(year, id);
        } else {
          this.router.navigate(['/not-found']);
          return EMPTY;
        }
      })
    );

    this.route.queryParamMap.pipe(
      filter(p => p.has('e')),
      map(p => Boolean(p.get('e'))),
      takeUntil(this.unsubscribe$)
    ).subscribe(p => this.edit = p);

    this.order.pipe(takeUntil(this.unsubscribe$)).subscribe(o => {
      this.service.getOrderProducts(o.orderYear || 0, o.id || 0).pipe(
        takeUntil(this.unsubscribe$)
      ).subscribe(p => {
        this.dataSource = new MatTableDataSource(p);
        if (p.some(o => o.specialTxt)) {
          if (!this.displayCols.includes('specialTxt')) {
            this.displayCols.splice(4, 0, 'specialTxt');
          }
        }
        this.subtotal = p.reduce((prev, curr) => prev + ((curr.finalPrice || 0) * (curr.quantity || 0)), 0);
      })
    });
  }

  cancelOrder(ord: Order): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogData('Confirmar', `¿Está seguro de cancelar su orden #${ord.orderYear}${ord.id}?`)
    });
    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((r: ConfirmDialogData) => {
      if (r.action === 'confirm') {
        const val = { idOrder: ord.id, orderYear: ord.orderYear };
        this.service.cancelOrder(val).pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
          this.order = this.service.getOrderById(ord.orderYear || 0, ord.id || 0);
        });
      }
    });
  }

}
