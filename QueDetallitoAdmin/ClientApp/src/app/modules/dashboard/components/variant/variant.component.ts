import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductionService } from '../../services/production.service';
import { MultiDialogComponent } from '../multi-dialog/multi-dialog.component';
import { ListVariant, Variant } from './variant';
import { VariantImagesComponent } from './variant-images/variant-images.component';

@Component({
  selector: 'app-variant',
  templateUrl: './variant.component.html',
  styleUrls: ['./variant.component.scss']
})
export class VariantComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  idProduct?: number;
  nameProduct?: string;
  edit: boolean = false;
  dataSource: MatTableDataSource<ListVariant> = new MatTableDataSource();
  idVariant?: number;
  variantForm = new FormGroup({
    nameVariant: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    stock: new FormControl(0, [Validators.required, Validators.min(1), Validators.max(254)]),
    customPrice: new FormControl(false),
    cost: new FormControl('0.00', [Validators.required, Validators.min(1)]),
    price: new FormControl({ value: '0.00', disabled: true }, [Validators.required, Validators.min(1)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(100)]),
    nextAvailability: new FormControl(0, [Validators.required, Validators.min(1)]),
    customOption: new FormControl(null),
    active: new FormControl(true, [Validators.required]),
    images: new FormControl('', [Validators.required]),
    fileSource: new FormControl('', Validators.required),
    messageLength: new FormControl({ value: '', disabled: true })
  });
  displayCols: string[] = ['id', 'name', 'stock', 'cost', 'price', 'discount', 'finalPrice',
        'nextAvailability', 'customOption', 'created', 'active', 'edit'];
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private service: ProductionService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _location: Location
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.idProduct = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    this.nameProduct = this.route.snapshot.paramMap.get('name') || undefined;
    this.getVariants();
    this.customOptionsValueChanges();
  }

  getVariants(): void {
    this.service.getVariants(this.idProduct || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(v => {
      this.dataSource = new MatTableDataSource(v);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  customOptionsValueChanges(): void {
    this.variantForm.controls.customOption.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe(o => {
      if (o === 3) {
        this.variantForm.controls.messageLength.enable();
        this.variantForm.controls.messageLength.setValidators([Validators.required, Validators.min(1)])
        this.variantForm.controls.messageLength.updateValueAndValidity();
      } else {
        this.variantForm.controls.messageLength.clearValidators();
        this.variantForm.controls.messageLength.updateValueAndValidity();
        this.variantForm.controls.messageLength.disable();
        this.variantForm.controls.messageLength.reset();
      }
    });
  }

  variantSubmit(): void {
    if (this.variantForm.invalid) {
      this.variantForm.markAsTouched();
      return;
    }
    if (!this.idVariant) {
      const formVariant = this.getFileVariantForm();
      this.service.addVariant(formVariant).pipe(takeUntil(this.unsubscribe$)).subscribe(v => this.resetForm());
    } else {
      const nVariant = this.getVariantForm();
      this.service.updateVariant(nVariant).pipe(takeUntil(this.unsubscribe$)).subscribe(v => this.resetForm());
    }
  }

  resetForm(): void {
    this.edit = false;
    this.idVariant = undefined;
    this.variantForm.reset({
      stock: 0, cost: '0.00', price: '0.00', discount: 0, nextAvailability: 0, active: true
    });
    this.variantForm.controls.images.enable();
    this.variantForm.controls.fileSource.enable();
    this.getVariants();
  }

  editVariant(v: ListVariant): void {
    this.edit = true;
    this.idVariant = v.idVariant;
    let option: number | undefined;
    switch (true) {
      case v.custNumber:
        option = 1;
        break;
      case v.custLetter:
        option = 2;
        break;
      case v.custMessage:
        option = 3;
        break;
    }
    this.variantForm.controls.images.disable();
    this.variantForm.controls.fileSource.disable();
    this.variantForm.controls.price.enable();
    this.variantForm.patchValue({
      nameVariant: v.nameVariant,
      stock: v.stock,
      customPrice: true,
      cost: v.cost,
      price: v.price,
      discount: v.discount,
      nextAvailability: v.nextAvailability,
      customOption: option,
      active: v.active,
      messageLength: v.messageLength
    });
  }

  calculateGain(): number {
    const cost: number = this.variantForm.controls.cost.value || 0;
    let price: number = this.variantForm.controls.price.value;
    const discount: number = this.variantForm.controls.discount.value || 0;
    price *= 1 - (discount / 100);
    const result: number = price - cost;
    return Number(result.toFixed(2));
  }

  calculateGainPerc(): number {
    const cost: number = this.variantForm.controls.cost.value || 0;
    let price: number = this.variantForm.controls.price.value;
    const discount: number = this.variantForm.controls.discount.value || 0;
    price *= 1 - (discount / 100);
    const perc: number = (price * 100 / cost) - 100;
    return Number(perc.toFixed(2));
  }

  calculateFinalPrice(): number {
    const price: number = this.variantForm.controls.price.value || 0;
    const discount: number = this.variantForm.controls.discount.value || 0;
    const finalPrice: number = ((100 - discount) / 100) * price;
    return Number(finalPrice.toFixed(2));
  }

  costChange(): void {
    if (this.variantForm.controls.customPrice.value) {
      return;
    }
    const cost: number = this.variantForm.controls.cost.value || 0;
    const price: number = cost * 1.6;
    this.variantForm.patchValue({ price: price.toFixed(2) });
  }

  customPriceChange(value: MatSlideToggleChange): void {
    if (value.checked) {
      this.variantForm.controls.price.enable();
    } else {
      this.variantForm.controls.price.disable();
      this.costChange();
    }
  }

  onFileChange(event: any): void {
    this.variantForm.patchValue({ fileSource: event.target.files });
  }

  showImages(v: ListVariant): void {
    this.dialog.open(VariantImagesComponent, {
      data: { title: `Imágenes de variante ${v.nameVariant}`, idProduct: v.idProduct, idVariant: v.idVariant }
    });
  }

  deleteVariant(v: ListVariant): void {
    const mDialog = this.dialog.open(MultiDialogComponent, {
      data: {
        title: '¿Eliminar variante?',
        message: 'Esta acción también eliminará todas sus imágenes.',
        okAction: 'Aceptar',
        cancelAction: 'Cancelar'
      }
    });
    mDialog.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
      if (val === 1) {
        this.service.deleteVariant(v.idVariant || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(res => this.getVariants());
      }
    });
  }

  private getVariantForm(): Variant {
    const v = this.variantForm.getRawValue();
    const nVariant: Variant = {
      idProduct: this.idProduct,
      idVariant: this.idVariant,
      nameVariant: v.nameVariant,
      stock: v.stock,
      cost: v.cost,
      price: v.price,
      discount: v.discount,
      nextAvailability: v.nextAvailability,
      custNumber: v.customOption === 1 ? true : false,
      custLetter: v.customOption === 2 ? true : false,
      custMessage: v.customOption === 3 ? true : false,
      active: v.active,
      messageLength: v.messageLength
    };
    return nVariant;
  }

  private getFileVariantForm(): FormData {
    const nVariant = this.getVariantForm();
    const images = this.variantForm.value.fileSource;
    const form = new FormData();
    for (let i = 0; i < images.length; i++) {
      form.append('images', images[i]);
    }
    form.append('variant.idProduct', nVariant.idProduct?.toString() || '');
    form.append('variant.nameVariant', nVariant.nameVariant || '');
    form.append('variant.stock', nVariant.stock?.toString() || '');
    form.append('variant.cost', nVariant.cost?.toString() || '');
    form.append('variant.price', nVariant.price?.toString() || '');
    form.append('variant.discount', nVariant.discount?.toString() || '');
    form.append('variant.nextAvailability', nVariant.nextAvailability?.toString() || '');
    form.append('variant.custNumber', nVariant.custNumber?.toString() || '');
    form.append('variant.custLetter', nVariant.custLetter?.toString() || '');
    form.append('variant.custMessage', nVariant.custMessage?.toString() || '');
    form.append('variant.active', nVariant.active?.toString() || '');
    form.append('variant.messageLength', nVariant.messageLength?.toString() || '');

    return form;
  }

  applyFilter(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.dataSource.filter = val.trim().toLowerCase();
  }

  goBack(): void {
    this._location.back();
  }

}
