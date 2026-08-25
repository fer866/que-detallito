import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatInput } from '@angular/material/input';
import { MatRadioChange } from '@angular/material/radio';
import { Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, share, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { ListProducts } from 'src/app/entities/product';
import { User } from 'src/app/entities/user';
import { BackendApiService } from 'src/app/services/backend-api.service';
import { CartService } from 'src/app/services/cart.service';
import { FilterService } from 'src/app/services/filter.service';
import { ProductApiService } from 'src/app/services/product-api.service';
import { SidenavService } from 'src/app/services/sidenav.service';
import { ThemeOption, ThemeOptions, ThemeService } from 'src/app/services/theme.service';
import { TokenService } from 'src/app/services/token.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { Menu, MenuOptions } from '../../entities/menu';
import { CartBottomSheetComponent } from '../cart-bottom-sheet/cart-bottom-sheet.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  menuOptions: Menu[] = MenuOptions;
  themeOption: Observable<string> = EMPTY;
  themeOptions: ThemeOption[] = ThemeOptions;
  isDark: Observable<boolean> = EMPTY;
  wishlistCount: Observable<number> = EMPTY;
  listFavorites: Observable<ListProducts[]> = EMPTY;
  cartCount: Observable<number> = EMPTY;
  isLogged: Observable<boolean> = EMPTY;
  showSearch: boolean = false;
  searchForm = new FormGroup({
    search: new FormControl('', [Validators.required, Validators.minLength(2)])
  });
  listSearch: Observable<ListProducts[]> = EMPTY;
  mobile: Observable<boolean> = EMPTY;
  @ViewChild('inputSearch', { static: false }) inputSearch?: MatInput;
  user: Observable<User> = EMPTY;

  constructor(
    private theme: ThemeService,
    private router: Router,
    private token: TokenService,
    private sidenavService: SidenavService,
    private bottomSheet: MatBottomSheet,
    private wishlistService: WishlistService,
    private cartService: CartService,
    private service: ProductApiService,
    private breakpointObserver: BreakpointObserver,
    private accountService: BackendApiService,
    private filterService: FilterService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.mobile = this.breakpointObserver.observe('(max-width: 600px)').pipe(map(b => b.matches), shareReplay(1));
    this.isLogged = this.token.isAuthenticationChanged.pipe(shareReplay(1));
    this.themeOption = this.theme.option;
    this.isDark = this.theme.isDark;
    this.wishlistService.getWishProducts();
    this.cartService.getCartItems();
    this.wishlistCount = this.wishlistService.products.pipe(map(f => f.length));
    this.listFavorites = this.wishlistService.products.pipe(map(f => f.slice(0, 3)), share());
    this.cartCount = this.cartService.items.pipe(map(p => p.length));
    this.initSearchForm();
    this.user = this.isLogged.pipe(
      switchMap(log => {
        if (log) {
          return this.accountService.getUserData();
        } else {
          return EMPTY;
        }
      })
    )
  }

  initSearchForm(): void {
    this.listSearch = this.searchForm.controls.search.valueChanges.pipe(
      debounceTime(900),
      distinctUntilChanged(),
      switchMap((val: string) => {
        if (val && this.searchForm.controls.search.valid) {
          return this.service.getSearchProducts(val);
        } else {
          return EMPTY;
        }
      })
    );
  }

  themeChange(val: MatRadioChange): void {
    this.theme.setThemeOption(val.value);
  }

  toggleSidenav(): void {
    this.sidenavService.toggle();
  }

  openCartItems(): void {
    let openedBottom = this.bottomSheet.open(CartBottomSheetComponent, { autoFocus: false });
    openedBottom.afterDismissed().pipe(takeUntil(this.unsubscribe$)).subscribe(a => {
      if (a) {
        if (a.params) {
          this.router.navigate([a.url, a.params]);
        } else {
          this.router.navigate([a.url]);
        }
      }
    });
  }

  signOffUser(): void {
    this.token.logout();
    this.router.navigate(['/home']);
    this.cartService.getCartItems();
    this.wishlistService.getWishProducts();
  }

  toggleSearchForm(val: boolean): void {
    this.showSearch = val;
    if (!val) {
      this.searchForm.reset();
    } else {
      setTimeout(() => this.inputSearch?.focus(), 1);
    }
  }

  setLastOptionValue(val: string): ListProducts {
    const product = new ListProducts();
    product.name = val;
    return product;
  }

  displayFn(value: ListProducts): string {
    return value && value.name ? value.name : '';
  }

  searchOptionSelected(e: MatAutocompleteSelectedEvent): void {
    this.toggleSearchForm(false);
    const last = e.source.options.last;
    if (last.id === e.option.id) {
      this.router.navigate(['/gifts'], { queryParams: { search: e.option.value.name } });
    } else {
      this.router.navigate(['/product', e.option.value.id]);
    }
  }

}
