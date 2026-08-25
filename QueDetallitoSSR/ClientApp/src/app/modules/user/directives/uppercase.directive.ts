import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[type=text][appUppercase]'
})
export class UppercaseDirective {

  constructor(private control: NgControl) { }

  @HostListener('input', ['$event']) onInput(event: Event) {
    const value = (event.target as HTMLInputElement)?.value;
    if (value) {
      this.control.control?.setValue(value.toUpperCase());
    }
  }
}
