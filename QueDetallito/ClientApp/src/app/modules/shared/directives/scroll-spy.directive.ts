import { ContentChildren, Directive, ElementRef, EventEmitter, HostListener, Input, Output, QueryList } from '@angular/core';
import { ScrollContentComponent } from '../components/scroll-content/scroll-content.component';

@Directive({
  selector: '[appScrollSpy]'
})
export class ScrollSpyDirective {
  @Output() public sectionChange = new EventEmitter<string>();
  @Input() mobile: boolean = false;
  private currentSection?: string;
  @ContentChildren(ScrollContentComponent, { read: ElementRef }) scrollList?: QueryList<ElementRef>;

  constructor() { }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    let currSection: string | undefined;
    const scrollTop = event.target.scrollingElement.scrollTop;
    const parentOffset = event.target.scrollingElement.offsetTop - (this.mobile ? 90 : 30);

    this.scrollList?.forEach(s => {
      const element = s.nativeElement;
      if ((element.offsetTop + parentOffset) <= scrollTop) {
        currSection = element.id;
      }
    });

    if (currSection !== this.currentSection) {
      this.currentSection = currSection;
      this.sectionChange.emit(this.currentSection);
    }
  }

}
