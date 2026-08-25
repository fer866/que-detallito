import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatalogsComponent } from './components/catalogs/catalogs.component';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { PromoComponent } from './components/promo/promo.component';
import { ResumeComponent } from './components/resume/resume.component';
import { SaleDetailComponent } from './components/sales/sale-detail/sale-detail.component';
import { SalesComponent } from './components/sales/sales.component';
import { VariantComponent } from './components/variant/variant.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'resume', component: ResumeComponent, data: { anim: 'resume' } },
      { path: 'catalogs', component: CatalogsComponent, data: { anim: 'catalogs' } },
      { path: 'products', component: ProductsComponent, data: { anim: 'products' } },
      { path: 'products/variants/:id/:name', component: VariantComponent, data: { anim: 'variant' } },
      { path: 'calendar', loadChildren: () => import('./modules/calendar/calendar.module').then(m => m.CalendarModule), data: { anim: 'calendar' } },
      { path: 'users', loadChildren: () => import('./modules/users/users.module').then(m => m.UsersModule), data: { anim: 'users' } },
      { path: 'promos', component: PromoComponent, data: { anim: 'promo' } },
      { path: 'sales', component: SalesComponent, data: { anim: 'sales' } },
      { path: 'sales/:id/:year', component: SaleDetailComponent, data: { anim: 'sales' } },
      { path: '', redirectTo: '/dashboard/resume', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
