import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { DeliveryDates, DeliveryTime } from 'src/app/entities/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductApiService } from 'src/app/services/product-api.service';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss']
})
export class DateTimePickerComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  deliveryForm = new FormGroup({
    deliveryDate: new FormControl('', Validators.required),
    idDeliveryTime: new FormControl('', Validators.required)
  });
  deliveryDates: Observable<DeliveryDates> = EMPTY;
  deliveryTimes: Observable<DeliveryTime[]> = EMPTY;
  @ViewChild('form', { static: false }) form?: FormGroupDirective;
  filterDates = (d: Date | null): boolean => { return true };

  constructor(
    private service: ProductApiService,
    private cartService: CartService,
    private dialogRef: MatDialogRef<DateTimePickerComponent>
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.initDeliveryTimes();
    this.deliveryDates = this.cartService.items.pipe(
      map(i => i.reduce((prev, curr) => Math.max(curr.nextAvailability || 0, prev), 0)),
      switchMap(m => this.service.getDeliveryDates(m))
    );
    this.service.getHolidays().pipe(takeUntil(this.unsubscribe$)).subscribe(holy => {
      this.filterDates = (d: Date | null): boolean => {
        let date = (d || new Date()).toISOString();
        date = date.substr(0, date.indexOf('T'));
        return !holy.some(h => h.indexOf(date) > -1);
      }
    });
  }

  initDeliveryTimes(): void {
    this.deliveryTimes = this.deliveryForm.controls.deliveryDate.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap(d => {
        if (d && this.deliveryForm.controls.deliveryDate.valid) {
          return this.service.getDeliveryTimes(d);
        } else {
          return EMPTY;
        }
      })
    );
  }

  getDateFromString(val?: string): Date {
    return new Date(val || '');
  }

  onSubmit(): void {
    const val = this.deliveryForm.value;
    this.cartService.changeDateTime(val.deliveryDate.toISOString(), val.idDeliveryTime);
    this.dialogRef.close();
  }

  triggerForm(): void {
    if (this.form) {
      this.form.ngSubmit.emit('save');
    }
  }

}
