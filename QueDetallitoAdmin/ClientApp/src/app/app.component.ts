import { Component, OnDestroy, OnInit, HostBinding } from '@angular/core';
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { ThemeService } from './modules/dashboard/services/theme.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ThemeOptions } from "./modules/dashboard/services/theme.service";
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';
import { fade } from './animations';
import { LoaderService } from './loader/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fade]
})
export class AppComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject();
  @HostBinding('class.dark-theme') isDarkTheme: boolean = false;

  constructor(
    private theme: ThemeService,
    private router: Router,
    private loader: LoaderService,
    private breakpoint: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // Router Lazy Loading
    this.router.events.pipe(
      filter(e => e instanceof RouteConfigLoadStart || e instanceof RouteConfigLoadEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe(e => {
      if (e instanceof RouteConfigLoadStart) {
        this.loader.change(true);
      }
      if (e instanceof RouteConfigLoadEnd) {
        this.loader.change(false);
      }
    });
    // Color Scheme Change
    this.breakpoint.observe('(prefers-color-scheme: dark)').pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.theme.option.pipe(takeUntil(this.unsubscribe$)).subscribe(t => {
        if (t === ThemeOptions[0].option) {
          this.isDarkTheme = c.matches;
          this.theme.setDark(this.isDarkTheme);
        }
      });
    });
    // Theme Option Change
    this.theme.option.pipe(takeUntil(this.unsubscribe$)).subscribe(t => {
      switch (t) {
        case ThemeOptions[0].option:  //Default
          this.isDarkTheme = this.breakpoint.isMatched('(prefers-color-scheme: dark)');
          this.theme.setDark(this.isDarkTheme);
          break;
        case ThemeOptions[1].option:  //Light
          this.isDarkTheme = false;
          this.theme.setDark(this.isDarkTheme);
          break;
        case ThemeOptions[2].option:  //Dark
          this.isDarkTheme = true;
          this.theme.setDark(this.isDarkTheme);
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation;
  }
}
