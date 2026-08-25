import { Platform } from '@angular/cdk/platform';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  newsletter = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required])
  });
  faFacebookF = faFacebookF;
  faInstagram = faInstagram;
  faWhatsapp = faWhatsapp;

  constructor(
    private snack: MatSnackBar,
    private platform: Platform
  ) { }

  ngOnInit(): void {
  }

  subscribeNewsletter(): void {
    this.snack.open('¡Bien, gracias por tu subscripción!', 'descartar', { duration: 7000 });
  }

  onFacebookClick(): void {
    switch (true) {
      case this.platform.ANDROID:
        window.location.href = 'intent://page/103479294925886?referrer=app_link#Intent;package=com.facebook.katana;scheme=fb;end';
        break;
      case this.platform.IOS:
        window.location.href = 'fb://page/?id=103479294925886';
        break;
      default:
        window.open('https://www.facebook.com/quedetallitomx', '_blank');
        break;
    }
  }

}
