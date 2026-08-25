import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(private router: Router, private token: TokenService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const url = state.url;
    return this.isAuth(url);
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }
  canLoad(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    let url: string = '';
    if (segments.length > 0) {
      segments.forEach(s => {
        url += '/' + s.path;
      });
    } else {
      url = '/' + route.path || '';
    }
    return this.isAuth(url);
  }

  private isAuth(url: string): boolean {
    if (!this.token.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { redirect: url } });
      return false;
    }
    return true;
  }
}
