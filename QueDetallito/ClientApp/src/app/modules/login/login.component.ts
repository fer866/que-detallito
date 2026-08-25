import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, filter, takeUntil } from 'rxjs/operators';
import { flyInOut } from 'src/app/animations';
import { BackendApiService } from 'src/app/services/backend-api.service';
import { CartService } from 'src/app/services/cart.service';
import { TokenService } from 'src/app/services/token.service';
import { WishlistService } from 'src/app/services/wishlist.service';
import { PasswordRegex } from "../../entities/user";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [flyInOut]
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  regex: RegExp = PasswordRegex;
  loginForm = new FormGroup({
    user: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(60)]),
    password: new FormControl('', [
      Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.regex)])
  });
  signInForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(60)]),
    password: new FormControl('', [
      Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(this.regex)]),
    repeatPassword: new FormControl('', [Validators.required]),
    noticePrivacy: new FormControl(false, Validators.requiredTrue)
  }, { validators: this.matchPasswords });
  forgotPasswordForm = new FormGroup({
    user: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(60)])
  });
  secureCodeCtrl = new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]);
  showPassword: boolean = false;
  showSignIn: boolean = false;
  showResetPassword: boolean = false;
  showResendEmail: boolean = false;
  resendEmail?: string;

  constructor(
    private router: Router,
    private service: BackendApiService,
    private route: ActivatedRoute,
    private snack: MatSnackBar,
    private title: Title,
    private token: TokenService,
    private cartService: CartService,
    private wishService: WishlistService
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Que Detallito | Iniciar sesión');
    this.route.queryParamMap.pipe(
      filter(p => p.has('signIn')), takeUntil(this.unsubscribe$)).subscribe(param => this.showSignIn = true);
    this.onSecureCodeSubmit();
  }

  matchPasswords(ctrl: AbstractControl)  {
    const password = ctrl.get('password');
    const repeatPassword = ctrl.get('repeatPassword');
    if (repeatPassword?.disabled) {
      return null;
    }
    if (password?.value !== repeatPassword?.value) {
      repeatPassword?.setErrors({ notSame: true });
      return { notSame: true };
    } else {
      return null;
    }
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      this.loginForm.markAsDirty();
      return;
    }
    this.service.auth(this.loginForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(token => {
      this.onSuccesLogin(token);
    }, error => {
      this.loginForm.patchValue({ password: '' });
      if (error?.error?.requiresAction) {
        this.resendEmail = this.loginForm.value.user;
        this.showResendEmail = true;
        this.loginForm.reset();
      }
    });
  }

  private onSuccesLogin(token: any): void {
    this.token.setToken(token);
    this.cartService.getCartItems();
    this.wishService.getWishProducts();
    if (this.route.snapshot.queryParamMap.has('redirect')) {
      const url = this.route.snapshot.queryParamMap.get('redirect');
      this.router.navigate([url]);
    } else {
      this.router.navigate(['/user']);
    }
  }

  resetSignIn(): void {
    this.signInForm.reset();
    this.showSignIn = this.showPassword = false;
    this.loginForm.reset();
  }

  onSignInSubmit(): void {
    if (this.signInForm.invalid) {
      this.signInForm.markAsTouched();
      this.signInForm.controls.noticePrivacy.markAsTouched();
      return;
    }
    this.service.register(this.signInForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      this.resendEmail = this.signInForm.value.email;
      this.showResendEmail = true;
      this.resetSignIn();
      this.snack.open(res.message, 'descartar', { duration: 7000 });
    });
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAsTouched();
      return;
    }
    this.service.forgotPassword(this.forgotPasswordForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      this.cancelForgotPassword();
      this.snack.open(res.message, 'descartar', { duration: 7000 });
    });
  }

  cancelForgotPassword(): void {
    this.showResetPassword = this.showPassword = false;
    this.forgotPasswordForm.reset();
    this.loginForm.reset();
  }

  cancelResendEmail(): void {
    this.resendEmail = undefined;
    this.showResendEmail = false;
  }

  onResendEmail(): void {
    this.service.resendEmailConfirmation(this.resendEmail || '').pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(r => null, error => {
      if (error?.error?.requiresAction) {
        this.cancelResendEmail();
      }
    });
  }

  onSecureCodeSubmit(): void {
    this.secureCodeCtrl.valueChanges.pipe(
      filter(v => this.secureCodeCtrl.valid),
      takeUntil(this.unsubscribe$)
    ).subscribe(v => {
      const val = { secureCode: v, user: this.resendEmail };
      this.service.validateSecureCode(val).pipe(takeUntil(this.unsubscribe$)).subscribe(token => {
        this.cancelResendEmail();
        this.onSuccesLogin(token);
      });
    });
  }

}
