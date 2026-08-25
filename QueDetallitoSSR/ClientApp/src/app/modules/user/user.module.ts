import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatListModule } from "@angular/material/list";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatDialogModule } from "@angular/material/dialog";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTabsModule } from "@angular/material/tabs";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatCardModule } from "@angular/material/card";
import { MatStepperModule } from "@angular/material/stepper";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";

import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AddressComponent } from './components/address/address.component';
import { SharedModule } from "../shared/shared.module";
import { OrdersComponent } from './components/orders/orders.component';
import { AddressContainerComponent } from './components/address-container/address-container.component';
import { PaymentMethodsComponent } from './components/payment-methods/payment-methods.component';
import { UppercaseDirective } from './directives/uppercase.directive';
import { CardNumberDirective } from './directives/card-number.directive';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OnlyNumberDirective } from './directives/only-number.directive';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { DateTimePickerModule } from "../date-time-picker/date-time-picker.module";


@NgModule({
  declarations: [
    UserComponent,
    SettingsComponent,
    AddressComponent,
    OrdersComponent,
    AddressContainerComponent,
    PaymentMethodsComponent,
    UppercaseDirective,
    CardNumberDirective,
    CheckoutComponent,
    OnlyNumberDirective,
    PaymentSuccessComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    SharedModule,
    MatToolbarModule,
    MatTabsModule,
    FontAwesomeModule,
    MatCheckboxModule,
    MatCardModule,
    MatStepperModule,
    MatRadioModule,
    MatTooltipModule,
    MatTableModule,
    DateTimePickerModule,
    MatPaginatorModule
  ]
})
export class UserModule { }
