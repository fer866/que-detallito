import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PasswordRegex, User } from 'src/app/entities/user';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { BackendApiService } from 'src/app/services/backend-api.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  editInfo: boolean = false;
  user?: User;

  personalForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    email: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')])
  });
  newPasswordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    repeatPassword: new FormControl('', [Validators.required])
  }, { validators: this.matchPasswords });
  newEmailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  showOldPassword: boolean = false;
  showPassword: boolean = false;
  showPasswordForm: boolean = false;
  showEmailForm: boolean = false;

  constructor(
    private service: BackendApiService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private token: TokenService,
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.service.getUserData().pipe(takeUntil(this.unsubscribe$)).subscribe(u => this.user = u);
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

  personalSubmit(): void {
    this.service.updatePersonalInfo(this.personalForm.value).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(p => this.resetPersonalForm(p.message));
  }

  editPersonalInfo(): void {
    this.editInfo = true;
    this.personalForm.setValue(
      { name: this.user?.name, lastName: this.user?.lastName, email: this.user?.email, phone: this.user?.phone }
    );
    this.personalForm.controls.email.disable();
  }

  resetPersonalForm(message?: string): void {
    this.editInfo = false;
    this.personalForm.reset();
    this.getUserData();
    if (message) {
      this.snack.open(message, 'descartar', { duration: 7000 });
    }
  }

  onResetPasswordForm(): void {
    this.newPasswordForm.reset();
    this.showPasswordForm = this.showOldPassword = this.showPassword = false;
  }

  onResetEmailForm(): void {
    this.newEmailForm.reset();
    this.showEmailForm = false;
  }

  onNewPasswordSubmit(): void {
    this.service.changePassword(this.newPasswordForm.value).pipe(takeUntil(this.unsubscribe$)).subscribe(p => {
      this.onResetPasswordForm();
    });
  }

  onChangeEmailSubmit(): void {
    const confirm = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogData(
        '¿Estás segur@ de cambiar tu correo?',
        'El cambio se realizará hasta que confirmes tu nuevo correo con un link que te enviaremos',
        'Aceptar',
        'Cancelar'
      )
    });
    confirm.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((c: ConfirmDialogData) => {
      if (c.action === 'confirm') {
        this.service.changeEmail(this.newEmailForm.value).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(e => this.onResetEmailForm());
      }
    });
  }

}
