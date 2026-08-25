import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Filter } from 'src/app/entities/filter';
import { CategoryProduct } from 'src/app/entities/product';
import { FilterService } from 'src/app/services/filter.service';
import { SidenavService } from 'src/app/services/sidenav.service';

@Component({
  selector: 'app-filter-product',
  templateUrl: './filter-product.component.html',
  styleUrls: ['./filter-product.component.scss']
})
export class FilterProductComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  listProducts: Observable<CategoryProduct[]> = EMPTY;
  totalProducts: Observable<number> = EMPTY;
  filters: Filter = new Filter();
  minPrice$ = new Subject<number>();
  maxPrice$ = new Subject<number>();

  constructor(
    private filterService: FilterService,
    private router: Router,
    private route: ActivatedRoute,
    private optNav: SidenavService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.filterService.clearFilters();
  }

  ngOnInit(): void {
    this.listProducts = this.filterService.products;
    this.totalProducts = this.filterService.count;
    this.filterService.filter.pipe(takeUntil(this.unsubscribe$)).subscribe(f => this.filters = f);
    this.loadCurrentParams();
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(e => e instanceof NavigationStart)
    ).subscribe(nav => {
      if (nav instanceof NavigationStart && nav.url !== '/gifts') {
        this.optNav.closeOptions();
      }
    });
    this.minPrice$.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe(value => {
      this.filterService.onFilterChange('minPrice', value || undefined);
    });
    this.maxPrice$.pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.unsubscribe$)).subscribe(value => {
      this.filterService.onFilterChange('maxPrice', value || undefined);
    });
  }

  categoryChange(value: any): void {
    this.filterService.onFilterChange('category', value);
  }

  changeOrderList(type: string): void {
    this.filterService.onFilterChange('order', type);
  }

  loadCurrentParams(): void {
    this.route.queryParamMap.pipe(delay(0), takeUntil(this.unsubscribe$)).subscribe(param => {
      param.keys.map(p => p as keyof Filter).forEach(k => {
        this.filterService.onFilterChange(k, param.get(k));
      });
    });
  }

}
