import { Component, Input, OnInit } from '@angular/core';
import { faFacebookF, faTelegramPlane, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Product } from 'src/app/entities/product';

@Component({
  selector: 'app-share-product',
  templateUrl: './share-product.component.html',
  styleUrls: ['./share-product.component.scss']
})
export class ShareProductComponent implements OnInit {
  faFacebookF = faFacebookF;
  faTelegram = faTelegramPlane;
  faWhatsapp = faWhatsapp;
  @Input() product?: Product;

  constructor() { }

  ngOnInit(): void {
  }

  sendToWhatsapp(): string {
    const msg = this.getMessage();
    return `https://wa.me/?text=${encodeURI(msg)}`;
  }

  sendToMail(): string {
    const msg = this.getMessage();
    const subject = `${this.product?.name} en Que Detallito`;
    return `mailto:%20?subject=${encodeURI(subject)}&body=${encodeURI(msg)}`;
  }

  sendToFacebook(): string {
    const url = `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fquedetallito.com%2Fproduct%2F${this.product?.id}`;
    return url;
  }

  sendToTelegram(): string {
    const msg = this.getMessage(true);
    const url = encodeURI(`https://quedetallito.com/product/${this.product?.id}`);
    return `https://t.me/share/url?url=${url}&text=${encodeURI(msg)}`;
  }

  private getMessage(onlyDesc?: boolean): string {
    const variant = this.product?.variants?.slice(0, 1)[0];
    const msg = `¡Tienes que ver este regalo! \ud83c\udf81\n${this.product?.name} $${variant?.finalPrice}\nhttps://quedetallito.com/product/${this.product?.id}`;
    if (onlyDesc) {
      return `¡Tienes que ver este regalo! \ud83c\udf81\n${this.product?.name} $${variant?.finalPrice}`;
    } else {
      return msg;
    }
  }

}
