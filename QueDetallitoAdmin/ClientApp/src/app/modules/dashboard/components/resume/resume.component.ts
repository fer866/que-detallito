import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { EMPTY, Observable, Subject } from "rxjs";
import { StatisticsService } from '../../services/statistics.service';
import { CartItems, Stat, StatNumbers } from "./stat";
import { ChartDataSets } from "chart.js";
import { Label } from "ng2-charts";
import { MatTableDataSource } from '@angular/material/table';
import { ListSales } from '../sales/sales';
import { SalesService } from '../../services/sales.service';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  stats: Observable<Stat[]> = EMPTY;
  statNumbers: Observable<StatNumbers[]> = EMPTY;
  colors: string[] = ['#9c27b0', '#ba68c8', '#6a1b9a', '#880e4f'];
  today: Date = new Date(Date.now());
  dateOption: number = 1;
  salesDataSource: MatTableDataSource<ListSales> = new MatTableDataSource();
  salesDisplayCols: string[] = ['totalProducts', 'totalPrice', 'deliveryDate', 'deliveryAddress', 'created', 'details'];
  yearSelected: number = 2021.1;
  lineData: ChartDataSets[] = [
    { data: [3650,32700,12900,18300,36100,17500], label: 'Estimación 1' },
    { data: [4250,22700,9500,13300,38210,11900], label: 'Estimación 2' }
  ];
  lineLabels: Label[] = ['enero','febrero','marzo','abril','mayo','junio'];
  cartDataSource: MatTableDataSource<CartItems> = new MatTableDataSource();
  cartDisplayCols: string[] = ['name', 'nameVariant', 'quantity', 'specialTxt', 'deliveryDate'];
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(private service: StatisticsService, private salesService: SalesService) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.stats = this.service.getStatistics();
    this.getNumbers(this.dateOption);
    this.getLastestSales();
    this.getCartItems();
  }

  getNumbers(opt: number): void {
    this.statNumbers = this.service.getStatisticsNumbers(opt);
  }

  getLastestSales(): void {
    this.salesService.getLastestSales().pipe(takeUntil(this.unsubscribe$)).subscribe(s => {
      this.salesDataSource = new MatTableDataSource(s);
    });
  }

  getCartItems(): void {
    this.salesService.getCartItems().pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.cartDataSource = new MatTableDataSource(c);
      this.cartDataSource.paginator = this.paginator || null;
    });
  }

  dateOptionChange(val: MatButtonToggleChange): void {
    this.dateOption = val.value;
    this.getNumbers(this.dateOption);
  }

  onyearChange(val: MatButtonToggleChange): void {
    this.yearSelected = val.value;
  }

}
