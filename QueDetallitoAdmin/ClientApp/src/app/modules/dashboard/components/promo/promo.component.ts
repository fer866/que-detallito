import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Catalog, ProductionService } from '../../services/production.service';
import { MultiDialogComponent } from '../multi-dialog/multi-dialog.component';
import { ListProduct } from '../products/product';
import { ListPromo, RouterList, RouterName } from './promo';

@Component({
  selector: 'app-promo',
  templateUrl: './promo.component.html',
  styleUrls: ['./promo.component.scss']
})
export class PromoComponent implements OnInit {
  unsubscribe$ = new Subject();
  edit: boolean = false;
  dataSource: MatTableDataSource<ListPromo> = new MatTableDataSource();
  idPromo?: number;
  displayColumns: string[] = ['image', 'id', 'name', 'promoBegin', 'promoExpires', 'routerName', 'param', 'option', 'edit'];
  promoForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    promoBegin: new FormControl(null, [Validators.required]),
    promoExpires: new FormControl(null, [Validators.required]),
    file: new FormControl(null, [Validators.required]),
    fileSource: new FormControl(null, [Validators.required]),
    fileSm: new FormControl(null, [Validators.required]),
    fileSourceSm: new FormControl(null, [Validators.required]),
    routerName: new FormControl(null, Validators.maxLength(50)),
    routerParam: new FormControl(null),
    queryParam: new FormControl(null),
    isCategory: new FormControl(false),
    isTemporal: new FormControl(false),
    isCarousel: new FormControl(false)
  }, { validators: this.atLeastOne });
  categories: Observable<Catalog[]> = EMPTY;
  products: Observable<ListProduct[]> = EMPTY;
  routesList: RouterName[] = RouterList;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(private service: ProductionService, private snack: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.getPromos();
    this.categories = this.service.getCatalogs(1);
    this.products = this.service.getProducts();
  }

  atLeastOne(aCtrl: AbstractControl): {} | null {
    const isCategory = aCtrl.get('isCategory');
    const isTemporal = aCtrl.get('isTemporal');
    const isCarousel = aCtrl.get('isCarousel');
    if (!isCategory?.value && !isTemporal?.value && !isCarousel?.value) {
      isCategory?.setErrors({ atLeastOne: true });
      isTemporal?.setErrors({ atLeastOne: true });
      isCarousel?.setErrors({ atLeastOne: true });
      return { atLeastOne: true };
    } else {
      return null;
    }
  }

  getPromos(): void {
    this.service.getPromos().pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.dataSource = new MatTableDataSource(p);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  onFileChange(event: any, small: boolean): void {
    if (!small) {
      this.promoForm.patchValue({ fileSource: event.target.files[0] });
    } else {
      this.promoForm.patchValue({ fileSourceSm: event.target.files[0] });
    }
  }

  onSubmit(): void {
    const val = this.promoForm.value;
    const form = this.buildFormData(val);
    if (!this.idPromo) {
      this.service.addPromo(form).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.resetForm(p.message));
    } else {
      this.service.updatePromo(form).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.resetForm(p.message));
    }
  }

  onImageClick(): void {

  }

  editPromo(p: ListPromo): void {
    this.edit = true;
    this.idPromo = p.id;
    this.promoForm.patchValue({
      name: p.name,
      promoBegin: p.promoBegin,
      promoExpires: p.promoExpires,
      routerName: p.routerName,
      routerParam: p.routerParam ? Number(p.routerParam) : undefined,
      queryParam: p.queryParam,
      isCategory: p.isCategory,
      isTemporal: p.isTemporal,
      isCarousel: p.isCarousel
    });
    this.promoForm.controls.file.clearValidators();
    this.promoForm.controls.fileSource.clearValidators();
    this.promoForm.controls.fileSm.clearValidators();
    this.promoForm.controls.fileSourceSm.clearValidators();
  }

  deletePromo(p: ListPromo): void {
    const mDialog = this.dialog.open(MultiDialogComponent, {
      data: {
        title: 'Confirmación',
        message: `¿Está seguro de eliminar la promoción "${p.name}"?`,
        okAction: 'Aceptar',
        cancelAction: 'Cancelar'
      }
    });
    mDialog.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      if (res === 1) {
        this.service.deletePromo(p.id || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(m => this.getPromos());
      }
    });
  }

  resetForm(message?: string): void {
    if (message) {
      this.snack.open(message, 'descartar', { duration: 7000 });
    }
    this.edit = false;
    this.idPromo = undefined;
    this.promoForm.reset({ isCategory: false, isTemporal: false, isCarousel: false });
    this.promoForm.controls.file.setValidators(Validators.required);
    this.promoForm.controls.fileSource.setValidators(Validators.required);
    this.promoForm.controls.fileSm.setValidators(Validators.required);
    this.promoForm.controls.fileSourceSm.setValidators(Validators.required);
    this.getPromos();
  }

  optionChange(val: MatSlideToggleChange, opt: number): void {
    if (!val.checked) {
      return;
    }
    switch (opt) {
      case 1:
        this.promoForm.patchValue({ isTemporal: false, isCarousel: false });
        break;
      case 2:
        this.promoForm.patchValue({ isCategory: false, isCarousel: false });
        break;
      case 3:
        this.promoForm.patchValue({ isCategory: false, isTemporal: false });
        break;
    }
  }

  private buildFormData(value: any): FormData {
    const form = new FormData();

    form.append('images', value.fileSource);
    form.append('images', value.fileSourceSm);
    if (this.idPromo) {
      form.append('promo.id', this.idPromo.toString());
    }
    form.append('promo.name', value.name || '');
    form.append('promo.promoBegin', value.promoBegin?.toISOString() || '');
    form.append('promo.promoExpires', value.promoExpires?.toISOString() || '');
    form.append('promo.routerName', value.routerName || '');
    form.append('promo.routerParam', value.routerParam || '');
    form.append('promo.queryParam', value.queryParam || '');
    form.append('promo.isCategory', value.isCategory?.toString() || '');
    form.append('promo.isTemporal', value.isTemporal?.toString() || '');
    form.append('promo.isCarousel', value.isCarousel?.toString() || '');

    return form;
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

}
