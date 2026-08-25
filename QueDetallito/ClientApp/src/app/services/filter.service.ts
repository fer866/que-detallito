import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Filter, SelectedFilter } from '../entities/filter';
import { CategoryProduct } from '../entities/product';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private _products = new BehaviorSubject<CategoryProduct[]>([]);
  private _filter = new Subject<Filter>();
  private _count = new BehaviorSubject<number>(0);
  private _selected = new BehaviorSubject<SelectedFilter[]>([]);

  products = this._products.asObservable();
  filter = this._filter.asObservable();
  count = this._count.asObservable();
  selected = this._selected.asObservable();

  private filterValue = new Filter();
  private counter: number = 0;
  private listSelected: SelectedFilter[] = [];

  constructor(private router: Router, private route: ActivatedRoute) { }

  addList(list: CategoryProduct[]): void {
    this._products.next(list);
    this.counter = 0;
    list.forEach(p => {
      this.counter += p.products?.length || 0;
    });
    this._count.next(this.counter);
  }

  onFilterChange(prop: keyof Filter, value: any, load?: boolean): void {
    this.filterValue[prop] = value;
    this._filter.next(this.filterValue);
    if (this.listSelected.some(s => s.key === prop)) {
      let index = this.listSelected.findIndex(s => s.key === prop);
      if (!value) {
        this.listSelected.splice(index, 1);
      } else {
        this.listSelected[index].value = value;
      }
    } else {
      this.listSelected.push({ key: prop, value: value });
    }
    this._selected.next(this.listSelected);
    if (!load) {
      this.changeParams(prop, value);
    }
  }

  private getCurrentParams(): any {
    let params: any = {};
    let paramsMap = this.route.snapshot.queryParamMap;
    this.route.snapshot.queryParamMap.keys.forEach(k => {
      params[k] = paramsMap.get(k);
    });
    return params;
  }

  private changeParams(key: string, value: any): void {
    let params = this.getCurrentParams();
    params[key] = value;
    this.router.navigate(['/gifts'], { queryParams: params, queryParamsHandling: 'merge' });
  }

  clearFilters(): void {
    this._filter.next(new Filter());
    this._selected.next([]);
  }
}
