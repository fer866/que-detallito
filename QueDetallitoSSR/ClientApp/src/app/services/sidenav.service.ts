import { Injectable } from '@angular/core';
import { MatSidenav, MatDrawerToggleResult } from "@angular/material/sidenav";

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  private sidenav?: MatSidenav;
  private optSidenav?: MatSidenav;

  constructor() { }

  setSidenav(sidenav: MatSidenav | undefined): void {
    this.sidenav = sidenav;
  }

  setOptSidenav(sidenav: MatSidenav | undefined): void {
    this.optSidenav = sidenav;
  }

  open(): Promise<MatDrawerToggleResult> | undefined {
    return this.sidenav?.open();
  }

  openOptions(): Promise<MatDrawerToggleResult> | undefined {
    return this.optSidenav?.open();
  }

  close(): Promise<MatDrawerToggleResult> | undefined {
    return this.sidenav?.close();
  }
  
  closeOptions(): Promise<MatDrawerToggleResult> | undefined {
    return this.optSidenav?.close();
  }

  toggle(isOpen?: boolean): Promise<MatDrawerToggleResult> | undefined {
    return this.sidenav?.toggle(isOpen);
  }

  toggleOptions(isOpen?: boolean): Promise<MatDrawerToggleResult> | undefined {
    return this.optSidenav?.toggle(isOpen);
  }  
}
