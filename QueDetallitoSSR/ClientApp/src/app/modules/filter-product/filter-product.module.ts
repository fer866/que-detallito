import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";

import { FilterProductComponent } from "./filter-product.component";
import { FilterCategoryPipe, FilterPricePipe, OrderPipe, FilterProductPipe } from "./pipes/filter-product.pipe";

@NgModule({
  declarations: [
    FilterProductComponent,
    FilterCategoryPipe,
    FilterPricePipe,
    OrderPipe,
    FilterProductPipe
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    FormsModule
  ],
  exports: [
    FilterProductComponent,
    FilterCategoryPipe,
    FilterPricePipe,
    OrderPipe,
    FilterProductPipe
  ]
})
export class FilterProductModule { }
