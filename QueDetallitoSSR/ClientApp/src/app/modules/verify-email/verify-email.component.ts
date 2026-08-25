import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PasswordRegex } from 'src/app/entities/user';
import { BackendApiService } from 'src/app/services/backend-api.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  finished: boolean = false;
  valid: boolean = false;
  message?: string;
  passwordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    repeatPassword: new FormControl('', Validators.required)
  }, { validators: this.matchPasswords });
  showPassword: boolean = false;
  token?: string;
  showResetPassword: boolean = false;

  constructor(
    private service: BackendApiService,
    private route: ActivatedRoute,
    private router: Router,
    private title: Title
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.title.setTitle('Que Detallito | Verificación');
    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe(param => {
      if (!param.has('token')) {
        this.finished = true;
        this.message = 'Lo sentimos, la solicitud no es válida';
        return;
      }
      this.token = param.get('token') || undefined;
      if (param.has('res')) {
        this.showResetPassword = true;
      } else {
        this.confirmEmail();
      }
    });
  }

  setRedirection(): void {
    setTimeout(() => {
      if (this.valid) {
        this.router.navigate(['/login']);
      } else {
        this.router.navigate(['/home']);
      }
    }, 10000);
  }

  confirmEmail(): void {
    this.service.verifyEmail(this.token || '').pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
      this.finished = this.valid = true;
      this.message = res.message;
      this.setRedirection();
    }, error => {
      this.finished = true;
      this.message = error.message;
      this.setRedirection();
    });
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

  onChangePasswordSubmit(): void {
    const value = this.passwordForm.value;
    value.token = this.token;
    this.service.resetPassword(value).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.finished = this.valid = true;
      this.message = p.message;
      this.showResetPassword = false;
      this.setRedirection();
    }, error => {
      this.finished = true;
      this.valid = this.showResetPassword = false;
      this.message = error?.error?.message;
      this.setRedirection();
    });
  }

}
