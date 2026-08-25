import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { delay, map, shareReplay, takeUntil } from 'rxjs/operators';
import { Filter, SelectedFilter } from 'src/app/entities/filter';
import { CategoryProduct } from 'src/app/entities/product';
import { FilterService } from 'src/app/services/filter.service';
import { ProductApiService } from 'src/app/services/product-api.service';
import { SidenavService } from 'src/app/services/sidenav.service';

@Component({
  selector: 'app-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss']
})
export class GiftsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  tablet: Observable<boolean> = EMPTY;
  products: CategoryProduct[] = [];
  filters: Filter = new Filter();
  filterSelected: Observable<SelectedFilter[]> = EMPTY;

  constructor(
    private service: ProductApiService,
    private router: Router,
    private title: Title,
    private sidenav: SidenavService,
    private filterService: FilterService,
    private breakpoint: BreakpointObserver
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.tablet = this.breakpoint.observe('(max-width: 992px)').pipe(map(b => b.matches), shareReplay(1));
    this.title.setTitle('Que Detallito | regalos');
    this.service.getProducts().pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.products = p;
      this.filterService.addList(this.products);
    });
    this.filterService.filter.pipe(delay(0), takeUntil(this.unsubscribe$)).subscribe(f => this.filters = f);
    this.filterSelected = this.filterService.selected.pipe(delay(0));
  }

  toggleOptionsSidenav(): void {
    this.sidenav.toggleOptions();
  }

  getTotalFiltered(list: CategoryProduct[]): number {
    let count = 0;
    list.forEach(a => { count += a.products?.length || 0; });
    return count;
  }

  removeFilterChip(key: keyof Filter): void {
    this.filterService.onFilterChange(key, undefined);
  }

}
