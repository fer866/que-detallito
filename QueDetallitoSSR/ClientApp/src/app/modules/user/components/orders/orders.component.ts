import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Order } from 'src/app/entities/checkout';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  currentPeriod: number = 3;
  dataSource: MatTableDataSource<Order> = new MatTableDataSource();
  tablet: Observable<boolean> = EMPTY;
  displayCols: string[] = ['url','orderNo','total','deliveryDate','nameDelivery','orderStatus'];
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private service: CheckoutService,
    private breakpoint: BreakpointObserver
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.tablet = this.breakpoint.observe('(max-width: 992px)').pipe(map(o => o.matches), shareReplay());
    this.service.getOrdersByPeriod(this.currentPeriod).pipe(takeUntil(this.unsubscribe$)).subscribe(o => {
      this.dataSource = new MatTableDataSource(o);
      this.dataSource.paginator = this.paginator || null;
    });
  }

  changePeriod(period: number): void {
    this.currentPeriod = period;
  }

}
