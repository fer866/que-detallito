import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PasswordRegex } from '../entities/user';
import { BackendApiService } from '../modules/dashboard/services/backend-api.service';
import { TokenService } from '../modules/dashboard/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  showPassword: boolean = false;
  newPassword: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    confirmPassword: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)])
  }, { validators: this.matchPasswords } );

  constructor(
    private service: BackendApiService,
    private token: TokenService,
    private router: Router,
    private snack: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {

  }

  matchPasswords(aCtrl: AbstractControl): {} | null {
    const password = aCtrl.get('password');
    const confirmPassword = aCtrl.get('confirmPassword');
    if (confirmPassword?.disabled) {
      return null;
    }
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ notSame: true });
      return { notSame: true };
    } else {
      return null;
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAsTouched();
      this.loginForm.markAsDirty();
      return;
    }
    if (this.newPassword) {
      this.resetPasswordSubmit();
      return;
    }
    this.service.isResetPasswordRequired(this.loginForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(i => {
      if (i.reset) {
        this.loginForm.controls.confirmPassword.enable();
        this.loginForm.patchValue({ password: '' });
        this.loginForm.controls.email.disable();
        this.newPassword = true;
        this.snack.open('Debes generar una nueva contraseña para entrar', 'descartar', { duration: 7000 });
      } else {
        this.loginSubmit();
      }
    }, error => {
      this.loginForm.patchValue({ email: this.loginForm.controls.email.value, password: '' });
    });
  }

  private loginSubmit(): void {
    this.service.auth(this.loginForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.token.setToken(data);
      this.router.navigate(['/dashboard']);
    }, error => {
      this.loginForm.patchValue({ email: this.loginForm.controls.email.value, password: '' });
    });
  }

  private resetPasswordSubmit(): void {
    this.service.updateAccountPassword(this.loginForm.getRawValue()).pipe(takeUntil(this.unsubscribe$)).subscribe(l => {
      this.token.setToken(l);
      this.router.navigate(['/dashboard']);
    }, error => {
      this.loginForm.patchValue({ email: this.loginForm.controls.email.value, password: '', confirmPassword: '' });
      this.loginForm.controls.email.enable();
      this.newPassword = false;
    });
  }

}
