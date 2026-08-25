import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { CartBottomSheetComponent } from 'src/app/components/cart-bottom-sheet/cart-bottom-sheet.component';
import { DeliveryDates, DeliveryTime, Product, ProductReview, Variants } from 'src/app/entities/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductApiService } from 'src/app/services/product-api.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { CoverageComponent } from '../shared/components/coverage/coverage.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  product?: Product;
  variant?: Variants;
  isFavorite: boolean = false;
  productForm = new FormGroup({
    idProduct: new FormControl(0, Validators.required),
    idVariant: new FormControl(0, Validators.required),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    deliveryDate: new FormControl('', Validators.required),
    idDeliveryTime: new FormControl('', Validators.required),
    specialTxt: new FormControl(null)
  });
  deliveryDates: Observable<DeliveryDates> = EMPTY;
  deliveryTimes: Observable<DeliveryTime[]> = EMPTY;
  tabSelected: number = 0;
  filterDates = (d: Date | null): boolean => { return true };
  reviews: Observable<ProductReview[]> = EMPTY;
  pageLow: number = 0;
  pageHigh: number = 4;

  constructor(
    private route: ActivatedRoute,
    private service: ProductApiService,
    private snack: MatSnackBar,
    private wishlist: WishlistService,
    private router: Router,
    private cartService: CartService,
    private bottomSheet: MatBottomSheet,
    private title: Title,
    private meta: Meta,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        if (!params.has('id')) {
          this.router.navigate(['/page-not-found']);
          return EMPTY;
        }
        const id = Number(params.get('id'));
        return this.service.getProductById(id);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(p => this.initData(p), error => {
      this.router.navigate(['/page-not-found']);
    });
    this.initDeliveryTimes();
  }

  initData(p: Product): void {
    this.title.setTitle(p.name ?? 'Que Detallito');
    this.meta.updateTag({ name: 'description', content: `${p.name} - ${p.shortDesc}` });
    this.product = p;
    if (p.variants) {
      this.variant = p.variants[0];
      this.getDeliveryDates(this.variant.nextAvailability || 0);
    }
    this.wishlist.products.pipe(
      map(ps => ps.some(v => v.id === p.id)),
      takeUntil(this.unsubscribe$)
    ).subscribe(w => this.isFavorite = w);
    this.productForm.patchValue({ idProduct: p.id, idVariant: this.variant?.idVariant });
    this.setVariantValidators();
    this.service.getHolidays().pipe(takeUntil(this.unsubscribe$)).subscribe(holy => {
      this.filterDates = (d: Date | null): boolean => {
        let date = (d || new Date()).toISOString();
        date = date.substr(0, date.indexOf('T'));
        return !holy.some(h => h.indexOf(date) > -1);
      }
    });
    this.reviews = this.service.getProductReviews(p.id || 0).pipe(shareReplay(1));
  }

  initDeliveryTimes(): void {
    this.deliveryTimes = this.productForm.controls.deliveryDate.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(d => {
        if (d && this.productForm.controls.deliveryDate.valid) {
          return this.service.getDeliveryTimes(d);
        } else {
          return EMPTY;
        }
      })
    );
  }

  getDeliveryDates(next: number): void {
    this.deliveryDates = this.service.getDeliveryDates(next).pipe(shareReplay(1));
  }

  buyClicked(): void {
    this.cartService.addProductToCart(this.productForm.value);
    this.productForm.reset({ idProduct: this.product?.id, idVariant: this.variant?.idVariant, quantity: 1 });
    const closedBottom = this.bottomSheet.open(CartBottomSheetComponent, { autoFocus: false });
    closedBottom.afterDismissed().pipe(takeUntil(this.unsubscribe$)).subscribe(a => {
      if (a) {
        if (a.params) {
          this.router.navigate([a.url, a.params]);
        } else {
          this.router.navigate([a.url]);
        }
      }
    });
  }

  favoriteClicked(): void {
    let message: string = '';
    if (!this.isFavorite) {
      this.wishlist.addWishlistProduct(this.product?.id || 0);
      message = 'Ya lo guardamos como favorito';
    } else {
      this.wishlist.removeWishlistProduct(this.product?.id || 0);
      message = 'Quitado de favoritos';
    }
    this.snack.open(message, 'entendido', { duration: 7000 });
  }

  changeVariant(vari: Variants): void {
    this.variant = vari;
    this.productForm.reset({ idProduct: this.product?.id, idVariant: vari.idVariant, quantity: 1 });
    this.setVariantValidators();
    this.getDeliveryDates(vari.nextAvailability || 0);
  }

  setVariantValidators(): void {
    if (this.variant?.custNumber || this.variant?.custNumber || this.variant?.custMessage) {
      switch (true) {
        case this.variant.custNumber:
          this.productForm.controls.specialTxt.setValidators([Validators.required, Validators.min(0), Validators.max(9)]);
          break;
        case this.variant.custLetter:
          this.productForm.controls.specialTxt.setValidators([Validators.required, Validators.maxLength(1)]);
          break;
        case this.variant.custMessage:
          this.productForm.controls.specialTxt.setValidators([Validators.required, Validators.maxLength(this.variant?.messageLength || 15)]);
          break;
      }
    } else {
      this.productForm.controls.specialTxt.clearValidators();
    }
    this.productForm.updateValueAndValidity();
  }

  reviewsClicked(): void {
    // this.router.navigate([], { fragment: 'reviews' });
    const element = document.querySelector('#reviews');
    if (element && element instanceof HTMLElement) {
      setTimeout(() => {
        window.scrollTo({ behavior: 'smooth', left: 0, top: element.offsetTop - 30 });
      }, 1);
    }
  }

  resetDateSelected(): void {
    this.productForm.controls.deliveryDate.reset();
    this.productForm.controls.idDeliveryTime.reset();
  }

  getDateFromString(val: string): Date {
    return new Date(val);
  }

  onPaginatorPage(e: PageEvent): void {
    this.pageLow = e.pageIndex * e.pageSize;
    this.pageHigh = this.pageLow + e.pageSize;
  }

  showCoverageMap(): void {
    this.dialog.open(CoverageComponent);
  }

}
