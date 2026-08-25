import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[type=text][appCardNumber]'
})
export class CardNumberDirective {

  constructor(private el: ElementRef) { }

  @HostListener('ngModelChange', ['$event']) onInput(event: string) {
    if (!event) {
      return;
    }
    this.inputChange(event, false);
  }

  @HostListener('keydown.backspace', ['$event']) onBackspace(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.inputChange(val, true);
  }

  private inputChange(val: string, backspace: boolean): void {
    val = val.replace(/\D/g, '');

    if (backspace && val.length <= 12) {
      val = val.substr(0, val.length - 1);
    }

    if (val.length === 0) {
      val = '';
    } else if (val.length <= 4) {
      val = val.replace(/^(\d{0,4})/, '$1 ');
    } else if (val.length <= 8) {
      val = val.replace(/^(\d{0,4})(\d{0,4})/, '$1 $2 ');
    } else if (val.length <= 12) {
      val = val.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})/, '$1 $2 $3 ');
    } else {
      val = val.replace(/^(\d{0,4})(\d{0,4})(\d{0,4})(.*)/, '$1 $2 $3 $4');
    }
    this.el.nativeElement.value = val;
  }
}
