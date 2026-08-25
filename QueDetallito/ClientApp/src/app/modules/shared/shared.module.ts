import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";

import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { ScrollContentComponent } from './components/scroll-content/scroll-content.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { CarouselItemComponent } from './components/carousel/carousel-item/carousel-item.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { CoverageComponent } from './components/coverage/coverage.component';

@NgModule({
  declarations: [
    ScrollSpyDirective,
    ScrollContentComponent,
    CarouselComponent,
    CarouselItemComponent,
    ConfirmDialogComponent,
    CoverageComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  exports: [
    ScrollSpyDirective,
    ScrollContentComponent,
    CarouselComponent,
    CarouselItemComponent,
    ConfirmDialogComponent,
    CoverageComponent
  ]
})
export class SharedModule { }
