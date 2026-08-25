import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EMPTY, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Catalog } from '../../../services/production.service';
import { SalesService } from '../../../services/sales.service';
import { ChangeOrderStatus } from '../sales';

@Component({
  selector: 'app-sale-status',
  templateUrl: './sale-status.component.html',
  styleUrls: ['./sale-status.component.scss']
})
export class SaleStatusComponent implements OnInit {
  private unsubscribe$ = new Subject();
  statusForm = new FormGroup({
    idStatus: new FormControl('', Validators.required),
    paymentCancelation: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    remark: new FormControl('', Validators.maxLength(200))
  });
  listStatus: Observable<Catalog[]> = EMPTY;

  constructor(
    private service: SalesService,
    @Inject(MAT_DIALOG_DATA) public data: ChangeOrderStatus,
    private dialog: MatDialogRef<SaleStatusComponent>
  ) { }

  ngOnInit(): void {
    this.listStatus = this.service.getNextOrderStatus(this.data.idOrder || 0, this.data.orderYear || 0);
  }

  onStatusSubmit(): void {
    const change = this.statusForm.value;
    change.id = this.data.idOrder;
    change.orderYear = this.data.orderYear;
    this.service.changeOrderStatus(change).pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.statusForm.reset();
      this.dialog.close(true);
    });
  }

  idStatusChange(id?: number): void {
    if (id && id === 2) {
      this.statusForm.controls.paymentCancelation.enable();
      this.statusForm.controls.remark.setValidators([Validators.required, Validators.maxLength(200)]);
      this.statusForm.controls.remark.updateValueAndValidity();
    } else {
      this.statusForm.controls.paymentCancelation.disable();
      this.statusForm.controls.paymentCancelation.reset();
      this.statusForm.controls.remark.setValidators(Validators.maxLength(200));
      this.statusForm.controls.remark.updateValueAndValidity();
    }
  }
}
