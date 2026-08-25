import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddressContainerComponent } from './components/address-container/address-container.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { SettingsComponent } from './components/settings/settings.component';

import { UserComponent } from './user.component';

const routes: Routes = [
  { 
    path: '',
    component: UserComponent,
    children: [
      { path: 'settings', component: SettingsComponent, data: { b: 'settings' } },
      { path: 'orders', component: OrdersComponent, data: { b: 'orders' } },
      { path: 'addresses', component: AddressContainerComponent, data: { b: 'addresses' } },
      { path: '', redirectTo: '/user/settings', pathMatch: 'full' }
    ]
  },
  { path: 'checkout', component: CheckoutComponent, data: { b: 'checkout' } },
  { path: 'checkout/:year/:id', component: PaymentSuccessComponent, data: { b: 'checkout/:year/:id' } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
