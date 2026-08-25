import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _key: string = '_theme';
  private metaLight: string = '#6a1b9a';
  private metaDark: string = '#e91e63';
  private _option = new BehaviorSubject<string>(this.optionSelected());
  private _isDark = new BehaviorSubject<boolean>(false);
  option = this._option.asObservable();
  isDark = this._isDark.asObservable();

  constructor(private meta: Meta, private storageService: LocalStorageService) { }

  setThemeOption(option: string): void {
    this.storageService.setItem(this._key, btoa(option));
    this._option.next(option);
  }

  setDark(val: boolean): void {
    this._isDark.next(val);
    if (val) {
      this.meta.updateTag({ name: 'theme-color', content: this.metaDark });
    } else {
      this.meta.updateTag({ name: 'theme-color', content: this.metaLight });
    }
  }

  private optionSelected(): string {
    const selected = this.storageService.getItem(this._key);
    if (selected === null ||
        selected === undefined ||
        selected === '') {
      return ThemeOptions[0].option;
    }
    return ThemeOptions.find(t => t.option === atob(selected))?.option || ThemeOptions[0].option;
  }
}

export interface ThemeOption {
  option: string;
  name: string;
}
export const ThemeOptions: ThemeOption[] = [
  { option: '000', name: 'Predeterminado por el sistema' },
  { option: '001', name: 'Claro' },
  { option: '002', name: 'Oscuro' }
];