import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatButtonModule } from "@angular/material/button";

import { GiftsRoutingModule } from './gifts-routing.module';
import { GiftsComponent } from './gifts.component';
import { SharedModule } from "../shared/shared.module";
import { FilterProductModule } from "../filter-product/filter-product.module";


@NgModule({
  declarations: [
    GiftsComponent
  ],
  imports: [
    CommonModule,
    GiftsRoutingModule,
    MatIconModule,
    MatChipsModule,
    SharedModule,
    FilterProductModule,
    MatButtonModule
  ]
})
export class GiftsModule { }
