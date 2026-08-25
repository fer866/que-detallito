import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { MatSidenavModule } from "@angular/material/sidenav";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CatalogsComponent } from './components/catalogs/catalogs.component';
import { ResumeComponent } from './components/resume/resume.component';
import { ProductsComponent } from './components/products/products.component';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MultiDialogComponent } from './components/multi-dialog/multi-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { VariantComponent } from './components/variant/variant.component';
import { VariantImagesComponent } from './components/variant/variant-images/variant-images.component';
import { PromoComponent } from './components/promo/promo.component';
import { MatExpansionModule } from "@angular/material/expansion";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ChartsModule } from "ng2-charts";
import { SalesComponent } from './components/sales/sales.component';
import { SaleDetailComponent } from './components/sales/sale-detail/sale-detail.component';
import { MatListModule } from "@angular/material/list";
import { DeliveryTimesComponent } from './components/catalogs/delivery-times/delivery-times.component';
import { SaleStatusComponent } from './components/sales/sale-status/sale-status.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CatalogsComponent,
    ResumeComponent,
    ProductsComponent,
    MultiDialogComponent,
    VariantComponent,
    VariantImagesComponent,
    PromoComponent,
    SalesComponent,
    SaleDetailComponent,
    DeliveryTimesComponent,
    SaleStatusComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatRadioModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatSortModule,
    MatButtonToggleModule,
    ChartsModule,
    MatListModule
  ]
})
export class DashboardModule { }
