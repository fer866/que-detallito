import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { map, share, shareReplay } from 'rxjs/operators';
import { Promo } from 'src/app/entities/product';
import { ProductApiService } from 'src/app/services/product-api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mobile: Observable<boolean> = EMPTY;
  seasonPromos$: Observable<Promo[]> = EMPTY;
  promo$: Observable<Promo[]> = EMPTY;

  constructor(
    private service: ProductApiService,
    private router: Router,
    private breakpoint: BreakpointObserver,
    private title: Title
  ) { }

  ngOnInit(): void {
    this.mobile = this.breakpoint.observe('(max-width: 600px)').pipe(map(b => b.matches), shareReplay(1));
    this.title.setTitle('Que Detallito');
    this.seasonPromos$ = this.service.getSeasonPromos();
    this.promo$ = this.service.getPromos();
  }

  onProductClick(season: Promo) {
    if (season.temporal) {
      this.router.navigate([`/${season.routerName}`], { queryParams: { season: season.id } });
    } else {
      this.router.navigate([`/${season.routerName}`], { queryParams: { category: season.name } })
    }
  }

}
