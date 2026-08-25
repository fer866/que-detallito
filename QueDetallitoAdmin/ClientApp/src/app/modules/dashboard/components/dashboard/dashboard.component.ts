import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSidenav } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { EMPTY, Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { fade } from 'src/app/animations';
import { BackendApiService } from '../../services/backend-api.service';
import { ThemeOption, ThemeOptions, ThemeService } from '../../services/theme.service';
import { TokenService } from '../../services/token.service';
import { UserData } from '../../../../entities/user';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fade]
})
export class DashboardComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  tablet: boolean = false;
  mobile: Observable<boolean> = EMPTY;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav | undefined;
  themeOptions: ThemeOption[] = ThemeOptions;
  themeOption: Observable<string> | undefined;
  isDark: Observable<boolean> = EMPTY;
  userData: Observable<UserData> = EMPTY;

  constructor(
    private theme: ThemeService,
    private token: TokenService,
    private router: Router,
    private service: BackendApiService,
    private breakpoint: BreakpointObserver
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    const media$ = this.breakpoint.observe(['(max-width: 992px)', '(max-width: 600px)']);
    media$.pipe(map(b => b.breakpoints['(max-width: 992px)']), takeUntil(this.unsubscribe$)).subscribe(t => this.tablet = t);
    this.mobile = media$.pipe(map(b => b.breakpoints['(max-width: 600px)']), shareReplay(1));
    this.themeOption = this.theme.option;
    this.isDark = this.theme.isDark;
    this.userData = this.service.getUserData().pipe(shareReplay(1));
  }

  toggleSidenav(): void {
    this.sidenav?.toggle();
  }

  themeChange(val: MatRadioChange): void {
    this.theme.setThemeOption(val.value);
  }

  signOff(): void {
    this.token.logout();
    this.router.navigate(['/login']);
    this.service.revokeToken();
  }

  changeRouteMenu(): void {
    if (this.tablet) {
      this.sidenav?.toggle();
    }
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.anim;
  }

}
