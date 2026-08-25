import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[type=text][appOnlyNumber]'
})
export class OnlyNumberDirective {

  constructor(private el: ElementRef) { }

  @HostListener('ngModelChange', ['$event']) onChange(event: string) {
    if (!event) {
      return;
    }
    this.el.nativeElement.value = event.replace(/\D/g, '');
  }
}
