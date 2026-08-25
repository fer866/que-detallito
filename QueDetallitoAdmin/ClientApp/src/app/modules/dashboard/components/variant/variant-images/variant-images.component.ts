import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductionService } from '../../../services/production.service';
import { MultiDialogComponent } from '../../multi-dialog/multi-dialog.component';
import { ProductImage } from '../variant';

@Component({
  selector: 'app-variant-images',
  templateUrl: './variant-images.component.html',
  styleUrls: ['./variant-images.component.scss']
})
export class VariantImagesComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  listProductImage: Observable<ProductImage[]> = EMPTY;
  edit: boolean = false;
  imageForm = new FormGroup({
    images: new FormControl(null, Validators.required),
    fileSource: new FormControl(null, Validators.required)
  });

  constructor(
    private service: ProductionService,
    @Inject(MAT_DIALOG_DATA) public data: ProductImageData,
    private dialog: MatDialog
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getListProductImage();
  }

  getListProductImage(): void {
    this.listProductImage = this.service.getProductImages(this.data.idVariant || 0);
  }

  onFileChange(event: any): void {
    this.imageForm.patchValue({ fileSource: event.target.files[0] });
  }

  imageSubmit(): void {
    if (this.imageForm.invalid) {
      this.imageForm.markAsTouched();
      return;
    }
    const form = new FormData();
    const file = this.imageForm.value.fileSource;
    form.append('file', file);
    form.append('idProduct', this.data.idProduct?.toString() || '0');
    form.append('idVariant', this.data.idVariant?.toString() || '0');
    this.service.addProductImage(form).pipe(takeUntil(this.unsubscribe$)).subscribe(i => this.resetForm());
  }

  resetForm(): void {
    this.imageForm.reset();
    this.edit = false;
    this.getListProductImage();
  }

  deleteImage(img: ProductImage): void {
    const mDialog = this.dialog.open(MultiDialogComponent, {
      data: {
        title: 'Confirmar',
        okAction: 'Eliminar',
        message: '¿Está seguro de eliminar la imágen?',
        ancelAction: 'Cancelar'
      }
    });
    mDialog.beforeClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((v: number) => {
      if (v === 1) {
        this.service.deleteProductImage(img).pipe(takeUntil(this.unsubscribe$)).subscribe(i => this.getListProductImage());
      }
    })
  }

}

export class ProductImageData {
  title?: string;
  idProduct?: number;
  idVariant?: number;
}