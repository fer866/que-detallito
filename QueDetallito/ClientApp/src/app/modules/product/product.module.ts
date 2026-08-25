import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDividerModule } from "@angular/material/divider";
import { MatTabsModule } from "@angular/material/tabs";
import { MatListModule } from "@angular/material/list";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatDialogModule } from "@angular/material/dialog";

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { ImageholderComponent } from './components/imageholder/imageholder.component';
import { ShareProductComponent } from './components/share-product/share-product.component';
import { OnlyLettersDirective } from './directives/only-letters.directive';


@NgModule({
  declarations: [
    ProductComponent,
    BreadcrumbsComponent,
    ImageholderComponent,
    ShareProductComponent,
    OnlyLettersDirective
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    FontAwesomeModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatPaginatorModule,
    MatDialogModule
  ]
})
export class ProductModule { }
