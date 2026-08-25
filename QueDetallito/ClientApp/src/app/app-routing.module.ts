import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'home', component: HomeComponent, data: { a: 'home' } },
  { path: 'cart', loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule), data: { a: 'cart' } },
  { path: 'wishlist', loadChildren: () => import('./modules/wishlist/wishlist.module').then(m => m.WishlistModule), data: { a: 'wishlist' } },
  { path: 'about', loadChildren: () => import('./modules/about/about.module').then(m => m.AboutModule), data: { a: 'about' } },
  { path: 'gifts', loadChildren: () => import('./modules/gifts/gifts.module').then(m => m.GiftsModule), data: { a: 'gifts' } },
  { path: 'product/:id', loadChildren: () => import('./modules/product/product.module').then(m => m.ProductModule), data: { a: 'product/:id' } },
  {
    path: 'user',
    loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
    canLoad: [AuthGuard],
    canActivate: [AuthGuard],
    data: { a: 'user' }
  },
  { path: 'login', loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule), data: { a: 'login' } },
  { path: 'verify-email', loadChildren: () => import('./modules/verify-email/verify-email.module').then(m => m.VerifyEmailModule), data: { a: 'verify-email' } },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64]
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
