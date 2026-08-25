import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationStart, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { Menu, MenuOptions } from 'src/app/entities/menu';
import { SidenavService } from 'src/app/services/sidenav.service';
import { ThemeOption, ThemeOptions, ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  themeOption: Observable<string> = EMPTY;
  menuOptions: Menu[] = MenuOptions;
  tablet: Observable<boolean> = EMPTY;
  themeOptions: ThemeOption[] = ThemeOptions;
  @ViewChild('sidenav', { static: true }) sidenav?: MatSidenav;
  @ViewChild('optionsNav', { static: true }) optionsNav?: MatSidenav;
  showFilters: Observable<boolean> = EMPTY;

  constructor(
    private breakpoint: BreakpointObserver,
    private sidenavService: SidenavService,
    private theme: ThemeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tablet = this.breakpoint.observe('(max-width: 992px)').pipe(map(b => b.matches), shareReplay(1));
    this.sidenavService.setSidenav(this.sidenav);
    this.sidenavService.setOptSidenav(this.optionsNav);
    this.themeOption = this.theme.option;
    this.showFilters = this.router.events.pipe(
      filter(e => e instanceof NavigationStart),
      map(e => e instanceof NavigationStart && e.url.startsWith('/gifts', 0))
    );
  }

  themeChange(val: MatRadioChange) {
    this.theme.setThemeOption(val.value);
  }

  onSidenavItemClicked(option: Menu): void {
    this.sidenav?.close();
  }

}
