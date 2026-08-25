import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Catalog, ProductionService } from '../../services/production.service';

@Component({
  selector: 'app-catalogs',
  templateUrl: './catalogs.component.html',
  styleUrls: ['./catalogs.component.scss']
})
export class CatalogsComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  listCatalogType: Catalog[] = [
    { id: 1, name: 'Categorías de Productos', created: '' },
    { id: 2, name: 'Estatus de las Órdenes', created: '' },
    { id: 3, name: 'Formas de Pago', created: '' },
    { id: 4, name: 'Roles de Usuario', created: '' },
    { id: 5, name: 'Tiempos de Entrega para Productos', created: '' }
  ];
  selected: number = 1;
  displayCols: string[] = ['id', 'name', 'created', 'edit'];
  edit: boolean = false;
  idCatalog?: number;
  dataSource: MatTableDataSource<Catalog> = new MatTableDataSource();

  catalogForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(30)])
  });
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(private service: ProductionService) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getCatalog();
  }

  getCatalog(): void {
    this.service.getCatalogs(this.selected).pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.dataSource = new MatTableDataSource(c);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  catalogChange(val: MatSelectChange): void {
    if (val.value !== 5) {
      this.getCatalog();
    }
  }

  submitCatalog(): void {
    if (this.catalogForm.invalid) {
      this.catalogForm.markAsTouched();
      return;
    }
    const value = this.catalogForm.value;
    if (!this.idCatalog) {
      this.service.addCatalog(this.selected, value).pipe(takeUntil(this.unsubscribe$)).subscribe(c => this.resetForm());
    } else {
      value.id = this.idCatalog;
      this.service.editCatalog(this.selected, value).pipe(takeUntil(this.unsubscribe$)).subscribe(c => this.resetForm());
    }
  }

  editCatalog(cat: Catalog): void {
    this.edit = true;
    this.idCatalog = cat.id;
    this.catalogForm.setValue({ name: cat.name });
  }

  resetForm(): void {
    this.edit = false;
    this.idCatalog = undefined;
    this.catalogForm.reset();
    this.getCatalog();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

}
