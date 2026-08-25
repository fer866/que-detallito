import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, Observable, Subject } from "rxjs";
import { takeUntil } from 'rxjs/operators';
import { Catalog, ProductionService } from '../../services/production.service';
import { DialogOptions, MultiDialogComponent } from '../multi-dialog/multi-dialog.component';
import { ListProduct, Product } from './product';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  edit: boolean = false;
  idProduct: number | undefined;
  dataSource: MatTableDataSource<ListProduct> = new MatTableDataSource();
  listCategories: Observable<Catalog[]> = EMPTY;
  displayColumns: string[] = [
    'image', 'id', 'name', 'categoryName', 'descriptions', 'cost', 'price', 'finalPrice',
    'discount', 'variantsCount', 'active', 'edit'
  ];
  productForm = new FormGroup({
    idCat: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]),
    shortDesc: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    largeDesc: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]),
    active: new FormControl(true, Validators.required),
    idSeason: new FormControl(undefined)
  });
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(private service: ProductionService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getProducts();
    this.listCategories = this.service.getCatalogs(1);
  }

  getProducts(): void {
    this.service.getProducts().pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.dataSource = new MatTableDataSource(p);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  productClicked(p: ListProduct): void {
    const dialogRef = this.dialog.open(MultiDialogComponent, {
      data: {
        title: `¿Ver ${p.name}?`,
        message: 'Se abrirá una nueva ventana para ver el producto en Que Detallito',
        okAction: 'Aceptar',
        cancelAction: 'Cancelar'
      } as DialogOptions
    });
    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      if (r === 1) {
        window.open(`https://quedetallito.com/product/${p.id}`, '_blank');
      }
    })
  }

  showDescriptions(p: ListProduct): void {
    this.dialog.open(MultiDialogComponent, {
      data: { title: `Descripciones de ${p.name}`, shortText: p.shortDesc, largeText: p.largeDesc, cancelAction: 'Cerrar' }
    });
  }

  productSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAsTouched();
      return;
    }
    const product: Product = this.productForm.value;
    if (!this.idProduct) {
      this.service.addProduct(product).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.resetForm());
    } else {
      product.id = this.idProduct;
      this.service.updateProduct(product).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.resetForm());
    }
  }

  resetForm(): void {
    this.edit = false;
    this.idProduct = undefined;
    this.productForm.reset();
    this.productForm.updateValueAndValidity();
    this.getProducts();
  }

  editProduct(editProduct: ListProduct): void {
    this.edit = true;
    this.idProduct = editProduct.id;
    this.productForm.setValue({
      idCat: editProduct.idCat,
      name: editProduct.name,
      shortDesc: editProduct.shortDesc,
      largeDesc: editProduct.largeDesc,
      active: editProduct.active,
      idSeason: editProduct.idSeason
    });
  }

  deleteProduct(p: ListProduct): void {
    const confirm = this.dialog.open(MultiDialogComponent, {
      data: {
        title: `¿Eliminar ${p.name}?`,
        okAction: 'Aceptar',
        message: 'También eliminará todas sus variantes e imágenes.'
      }
    });
    confirm.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(val => {
      if (val === 1) {
        this.service.deleteProduct(p.id || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(p => this.getProducts());
      }
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

}
