import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appOnlyLetters]'
})
export class OnlyLettersDirective {
  @Input('appOnlyLetters') active: boolean = false;

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event) {
    if (!this.active) {
      return;
    }
    const value = (event.target as HTMLInputElement)?.value;
    if (value) {
      //Solo permite a-z, A-Z, ñ, Ñ
      this.ngControl.control?.setValue(value.replace(/[^a-zA-Z\u00f1\u00d1]/g, '').toUpperCase());
    }
  }
}
