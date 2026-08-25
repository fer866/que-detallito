import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Catalog, ProductionService } from '../../services/production.service';
import { SalesService } from '../../services/sales.service';
import { SaleStatusComponent } from './sale-status/sale-status.component';
import { ChangeOrderStatus, ListSales } from './sales';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  searchForm = new FormGroup({
    year: new FormControl(null, Validators.required),
    status: new FormControl(0, Validators.required)
  });
  autoRefresh: boolean = false;
  dataSource: MatTableDataSource<ListSales> = new MatTableDataSource();
  displayCols: string[] = ['id','orderStatus','totalProducts','paymentMethod','totalCost','totalPrice','deliveryDate','deliveryTime','created','modified','edit'];
  listYears: Observable<number[]> = EMPTY;
  listStatus: Observable<Catalog[]> = EMPTY;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  timerId: any;

  constructor(
    private service: SalesService,
    private catService: ProductionService,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.listYears = this.service.getSalesYears();
    this.listStatus = this.catService.getCatalogs(2);

    this.listYears.pipe(takeUntil(this.unsubscribe$)).subscribe(y => {
      this.searchForm.patchValue({ year: y[0] });
      this.onSearchSubmit();
    });
  }

  onSearchSubmit(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    if (this.autoRefresh) {
      this.timerId = setInterval(() => {
        console.log('refresh lanched');
        this.getSales();
      }, 60000);
    } else {
      this.getSales();
    }
  }

  getSales(): void {
    if (this.searchForm.invalid) {
      return;
    }
    const val = this.searchForm.value;
    this.service.getSales(val.year, val.status).pipe(takeUntil(this.unsubscribe$)).subscribe(s => {
      this.dataSource = new MatTableDataSource(s);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  applyFilter(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.dataSource.filter = val.trim().toLowerCase();
  }

  openChangeStatus(s: ListSales): void {
    const mDialog = this.dialog.open(SaleStatusComponent, {
      data: {
        idOrder: s.id,
        idStatus: s.idStatus,
        orderYear: s.orderYear,
        orderStatus: s.orderStatus
      } as ChangeOrderStatus
    });
    mDialog.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      if (r) {
        this.getSales();
      }
    });
  }

  yearChange(e: MatSelectChange): void {
    this.onSearchSubmit();
  }

  statusChange(e: MatSelectChange): void {
    this.onSearchSubmit();
  }
}
