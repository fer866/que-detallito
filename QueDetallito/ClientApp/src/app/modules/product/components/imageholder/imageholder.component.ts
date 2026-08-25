import { Component, Input, OnInit } from '@angular/core';
import { Images, Product, Variants } from 'src/app/entities/product';

@Component({
  selector: 'app-imageholder',
  templateUrl: './imageholder.component.html',
  styleUrls: ['./imageholder.component.scss']
})
export class ImageholderComponent implements OnInit {
  @Input() product?: Product;
  @Input() variant?: Variants;
  currentImage?: Images;

  constructor() { }

  ngOnInit(): void {
    if (this.variant && this.variant.images) {
      this.currentImage = this.variant.images[0];
    }
  }

  changeImage(img: Images): void {
    this.currentImage = img;
  }

  getCurrentImage(): string {
    if (this.variant && this.variant.images && !this.variant?.images?.some(v => v === this.currentImage)) {
      this.currentImage = this.variant.images[0];
      return this.currentImage.urlLocation || '';
    } else {
      return this.currentImage?.urlLocation || '';
    }
  }

}
