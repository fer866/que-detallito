import { Platform } from '@angular/cdk/platform';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesService } from '../../../services/sales.service';
import { SaleStatusComponent } from '../sale-status/sale-status.component';
import { ListSales, OrderProduct, ChangeOrderStatus } from '../sales';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  order: Observable<ListSales> = EMPTY;
  products: MatTableDataSource<OrderProduct> = new MatTableDataSource();
  displayCols: string[] = ['image','idProduct','name','nameVariant','specialTxt','quantity','cost','price'];

  constructor(
    private service: SalesService,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
      if (!param.has('id') && !Number(param.get('id')) && !param.has('year') && !Number(param.get('year'))) {
        this.router.navigate(['/not-found']);
      }
      const id = Number(param.get('id'));
      const year = Number(param.get('year'));
      this.order = this.service.getSale(id, year);
      this.service.getOrderProducts(id, year).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
        this.products = new MatTableDataSource(p);
      });

    });
  }

  getTotalCost(): number {
    return this.products.data.map(p => p).reduce((acc, value) => acc + ((value.cost || 0) * (value.quantity || 0)), 0);
  }

  getTotalPrice(): number {
    return this.products.data.map(p => p).reduce((acc, value) => acc + ((value.price || 0) * (value.quantity || 0)), 0);
  }

  getTotalQuantity(): number {
    return this.products.data.map(p => (p.quantity || 0)).reduce((acc, value) => acc + value, 0);
  }

  getMapsUrl(d: ListSales): void {
    const address = `${d.street}+${d.deliveryNumber},+${d.suburb},+${d.zipCode}+${d.town}`;
    // const url = `https://google.com/maps/place/${address.split(' ').join('+')}`;
    if (!this.platform.ANDROID) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.latitude},${d.longitude}`, "_blank");
    } else {
      window.location.href = `google.navigation:q=${d.latitude},${d.longitude}`;
    }
  }

  openChangeStatus(s: ListSales): void {
    const open = this.dialog.open(SaleStatusComponent, {
      data: {
        idOrder: s.id,
        idStatus: s.idStatus,
        orderStatus: s.orderStatus,
        orderYear: s.orderYear
      } as ChangeOrderStatus
    });
    open.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      if (r) {
        this.order = this.service.getSale(s.id || 0, s.orderYear || 0);
      }
    });
  }

}
