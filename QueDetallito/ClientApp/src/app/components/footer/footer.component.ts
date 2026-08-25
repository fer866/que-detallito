import { Platform } from '@angular/cdk/platform';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { faFacebookF, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BackendApiService } from 'src/app/services/backend-api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  newsletter = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required, Validators.maxLength(60)])
  });
  faFacebookF = faFacebookF;
  faInstagram = faInstagram;
  faWhatsapp = faWhatsapp;

  constructor(
    private snack: MatSnackBar,
    private platform: Platform,
    private service: BackendApiService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
  }

  subscribeNewsletter(): void {
    const val = this.newsletter.value;
    this.service.subscribeNewletter(val).pipe(takeUntil(this.unsubscribe$)).subscribe(n => {
      this.newsletter.reset();
      this.snack.open(n.message, 'descartar', { duration: 7000 });
    }, error => {
      this.newsletter.reset();
    });
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
