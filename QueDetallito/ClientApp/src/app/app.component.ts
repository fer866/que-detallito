import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { fade } from './animations';
import { LoaderService } from './services/loader.service';
import { PromptUpdateService } from './services/prompt-update.service';
import { ThemeOption, ThemeOptions, ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [fade]
})
export class AppComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  private themeOption?: ThemeOption;
  @HostBinding('class.dark-theme') isDarkTheme: boolean = false;

  constructor(
    private theme: ThemeService,
    private loader: LoaderService,
    private router: Router,
    private breakpoint: BreakpointObserver,
    private updateService: PromptUpdateService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    //Lazy loading routes
    this.router.events.pipe(
      filter(e => e instanceof RouteConfigLoadStart || e instanceof RouteConfigLoadEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe(e => {
      if (e instanceof RouteConfigLoadStart) {
        this.loader.change(true);
      } else if (e instanceof RouteConfigLoadEnd) {
        this.loader.change(false);
      }
    });
    //Scheme color change
    const colorScheme = this.breakpoint.observe('(prefers-color-scheme: dark)');
    colorScheme.pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.theme.option.pipe(takeUntil(this.unsubscribe$)).subscribe(t => {
        if (t === ThemeOptions[0].option) {
          this.isDarkTheme = c.matches
          this.theme.setDark(this.isDarkTheme);
        }
      });
    });
    //Theme Option Change
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

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.a;
  }
}
