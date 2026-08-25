import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ListUser, PasswordRegex } from 'src/app/entities/user';
import { BackendApiService } from '../../services/backend-api.service';
import { Catalog, ProductionService } from '../../services/production.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  listRoles: Observable<Catalog[]> = EMPTY;
  dataSource: MatTableDataSource<ListUser> = new MatTableDataSource();
  edit: boolean = false;
  idUser?: number;
  reset: boolean = false;
  displayColumns: string[] = ['id', 'roleName', 'fullName', 'email', 'phone', 'rfc', 'lastAccess', 'active', 'edit'];
  userForm = new FormGroup({
    idRole: new FormControl('', Validators.required),
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(50)]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]*')]),
    rfc: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)]),
    active: new FormControl(true, Validators.required)
  });
  newPassForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(PasswordRegex)])
  });
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private service: BackendApiService,
    private prodService: ProductionService,
    private snack: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.listRoles = this.prodService.getCatalogs(4);
    this.service.getUsers().pipe(takeUntil(this.unsubscribe$)).subscribe(u => {
      this.dataSource = new MatTableDataSource(u);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAsTouched();
      return;
    }
    const val = this.userForm.value;
    if (!this.idUser) {
      this.service.addUser(val).pipe(takeUntil(this.unsubscribe$)).subscribe(u => this.resetForm(true));
    } else {
      val.id = this.idUser;
      this.service.updateUser(val).pipe(takeUntil(this.unsubscribe$)).subscribe(u => this.resetForm());
    }
  }

  resetForm(success?: boolean): void {
    if (success) {
      this.snack.open('Se restableció la contraseña, el usuario tiene máximo 1 día para ingresar.',
        'descartar', { duration: 7000 });
    }
    this.userForm.reset({ active: true });
    this.userForm.controls.password.enable();
    this.edit = false;
    this.idUser = undefined;
    this.getUsers();
  }

  editUser(up: ListUser): void {
    this.edit = true;
    this.idUser = up.id;
    this.userForm.patchValue({
      idRole: up.idRole,
      name: up.name,
      lastName: up.lastName,
      email: up.email,
      phone: up.phone,
      rfc: up.rfc,
      active: up.active
    });
    this.userForm.controls.password.disable();
  }

  resetPassword(r: ListUser): void {
    this.reset = true;
    this.idUser = r.id;
  }

  applyFilter(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.dataSource.filter = val.trim().toLowerCase();
  }

  onResetPassSubmit(): void {
    if (this.newPassForm.invalid) {
      this.newPassForm.markAsTouched();
      return;
    }
    const val = this.newPassForm.value;
    val.id = this.idUser;
    this.service.resetPasswordUser(val).pipe(takeUntil(this.unsubscribe$)).subscribe(a => {
      this.snack.open('Se restableció la contraseña, el usuario tiene 1 día para cambiarla', 'descartar', { duration: 7000 });
      this.resetNewPassForm();
    });
  }

  resetNewPassForm(): void {
    this.reset = false;
    this.newPassForm.reset();
    this.idUser = undefined;
    this.getUsers();
  }

}
