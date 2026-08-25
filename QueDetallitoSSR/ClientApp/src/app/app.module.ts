import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';
import localeMx from '@angular/common/locales/es-MX';
import { registerLocaleData } from "@angular/common";
registerLocaleData(localeMx);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";

import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatBadgeModule } from "@angular/material/badge";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatListModule } from "@angular/material/list";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

import { LoaderComponent } from './components/loader/loader.component';
import { CustomInterceptor } from './services/custom.interceptor';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { CartBottomSheetComponent } from './components/cart-bottom-sheet/cart-bottom-sheet.component';
import { HomeComponent } from './components/home/home.component';
import { SharedModule } from "./modules/shared/shared.module";
import { FilterProductModule } from "./modules/filter-product/filter-product.module";
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorCustomService } from './services/paginator-custom.service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    LoaderComponent,
    PageNotFoundComponent,
    SidenavComponent,
    ToolbarComponent,
    FooterComponent,
    CartBottomSheetComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatTooltipModule,
    MatBadgeModule,
    MatToolbarModule,
    MatSidenavModule,
    MatBottomSheetModule,
    MatListModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    FilterProductModule,
    FontAwesomeModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'MXN' },
    { provide: HTTP_INTERCEPTORS, useClass: CustomInterceptor, multi: true },
    // { provide: APP_BASE_HREF, useValue: '/' },
    { provide: MatPaginatorIntl, useClass: PaginatorCustomService },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {panelClass: 'custom-snack'} }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
