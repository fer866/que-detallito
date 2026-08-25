import { isPlatformBrowser } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, AfterContentInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild('gallery_scroller') gallery_scroller?: ElementRef;
  @ContentChildren(CarouselItemComponent) items?: QueryList<CarouselItemComponent>;
  @Input() delay?: number;
  @Input() showArrows: boolean = true;
  galleryCount: number[] = [];
  currentPage: number = 0;
  private currentInterval: any;
  private currentTimeout: any;

  constructor(@Inject(PLATFORM_ID) private platformId: any) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngAfterContentInit(): void {
    this.initializeItems();
    this.items?.changes.pipe(takeUntil(this.unsubscribe$)).subscribe(i => {
      this.initializeItems();
    });
  }

  ngOnInit(): void {
    if (this.delay && this.delay !== 0 && this.delay > 0) {
      if (isPlatformBrowser(this.platformId)) {
        this.currentInterval = setInterval(() => {
          this.nextPage();
        }, this.delay * 1000);
      }
    }
  }

  onScroll(event: any) {
    const scrollLeft = event.target.scrollLeft;
    const parentOffset = event.target.offsetLeft - 5;
    
    this.items?.forEach((s, i) => {
      const element = s.element?.nativeElement;
      if ((element.offsetLeft + parentOffset) <= scrollLeft) {
        this.currentPage = i;
      }
    });
  }

  private clearScrollInterval(): void {
    if (!this.delay || this.delay === 0 || this.delay < 0) { return }
    if (isPlatformBrowser(this.platformId)) {
      clearInterval(this.currentInterval);
      clearTimeout(this.currentTimeout);
      this.currentTimeout = setTimeout(() => {
        this.currentInterval = setInterval(() => {
          this.nextPage();
        }, (this.delay || 0) * 1000);
      }, this.delay * 1000);
    }
  }

  private nextPage(): void {
    const itemSize = this.calculateScroll(this.currentPage + 1);
    // this.gallery_scroller?.nativeElement.scrollBy(itemSize, 0);
  }

  scrollToNextPage(): void {
    this.clearScrollInterval();
    const itemSize = this.calculateScroll(this.currentPage + 1);
    // this.gallery_scroller?.nativeElement.scrollBy(itemSize, 0);
  }

  scrollToPrevPage(): void {
    this.clearScrollInterval();
    const itemSize = this.calculateScroll(this.currentPage - 1);
    // this.gallery_scroller?.nativeElement.scrollBy(itemSize, 0);
  }

  private initializeItems(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.galleryCount = [];
        for (let index = 0; index < (this.items?.length || 0); index++) {
          this.galleryCount.push(index);
        }
      }, 0);
    }
  }

  changePage(index: number): void {
    if (index === this.currentPage) { return }
    this.clearScrollInterval();
    this.gallery_scroller?.nativeElement.scrollBy(this.calculateScroll(index), 0);
  }

  private calculateScroll(idx: number): number {
    const count = (this.items?.length || 0) - 1;
    let itemSize: number = 0;
    if (idx > count) {
      itemSize = -this.getTotalWidth(0, count);
    } else if (idx < 0) {
      itemSize = this.getTotalWidth(0, count);
    } else if (idx > this.currentPage) {
      itemSize = this.getTotalWidth(this.currentPage, idx);
    } else if (idx < this.currentPage) {
      itemSize = -this.getTotalWidth(idx, this.currentPage);
    }
    return itemSize;
  }

  private getTotalWidth(from: number, to: number): number {
    let totalWidth: number = 0;
    for (let index = from; index < to; index++) {
      const element = this.items?.map(i => i.element)[index];
      totalWidth += element?.nativeElement.clientWidth;
    }
    return totalWidth;
  }

}
