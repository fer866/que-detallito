import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { ProductionService } from '../../../services/production.service';
import { MultiDialogComponent } from '../../multi-dialog/multi-dialog.component';
import { DeliveryTime } from './delivery-times';

@Component({
  selector: 'app-delivery-times',
  templateUrl: './delivery-times.component.html',
  styleUrls: ['./delivery-times.component.scss']
})
export class DeliveryTimesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @Input() edit: boolean = false;
  @Output() editChange = new EventEmitter<boolean>();
  dataSource: MatTableDataSource<DeliveryTime> = new MatTableDataSource();
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  displayCols: string[] = ['id','name','weekday','maxTimeStr','active','created','edit'];
  timeForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
    startTimeStr: new FormControl('', Validators.required),
    endTimeStr: new FormControl('', Validators.required),
    saturday: new FormControl(false),
    sunday: new FormControl(false),
    maxTimeStr: new FormControl('', Validators.required),
    active: new FormControl(true)
  });
  idDeliveryTime?: number;

  constructor(private service: ProductionService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getDeliveryTimes();
    this.onTimesChanges();
  }

  getDeliveryTimes(): void {
    this.service.getDeliveryTimes().pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
      this.dataSource = new MatTableDataSource(d);
      this.dataSource.sort = this.sort || null;
      this.dataSource.paginator = this.paginator || null;
    });
  }

  onTimesChanges(): void {
    this.timeForm.valueChanges.pipe(
      filter(v => this.timeForm.controls.startTimeStr.valid && this.timeForm.controls.endTimeStr.valid),
      distinctUntilChanged(),
      debounceTime(500),
      takeUntil(this.unsubscribe$)
    ).subscribe(v => {
      this.timeForm.patchValue({ name: `${this.formatTime(v.startTimeStr)} - ${this.formatTime(v.endTimeStr)}` });
    });
  }

  formatTime(v: string): string {
    const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
    let hh = Number(v.substr(0, 2));
    if (hh > 12) {
      hh -= 12;
      return zeroPad(hh, 2) + v.substr(2, v.length) + ' PM';
    } else if (hh === 12) {
      return v + ' PM';
    } else {
      return v + ' AM';
    }
  }

  editTime(d: DeliveryTime): void {
    this.edit = true;
    this.editChange.emit(true);
    this.idDeliveryTime = d.id;
    this.timeForm.setValue({
      name: d.name,
      startTimeStr: d.startTimeStr,
      endTimeStr: d.endTimeStr,
      saturday: d.saturday,
      sunday: d.sunday,
      maxTimeStr: d.maxTimeStr,
      active: d.active
    });
  }

  onSubmitTime(): void {
    if (this.timeForm.invalid) {
      this.timeForm.markAsTouched();
      return;
    }
    const value = this.timeForm.value;
    if (!this.idDeliveryTime) {
      this.service.addDeliveryTime(value).pipe(takeUntil(this.unsubscribe$)).subscribe(d => this.onResetForm());
    } else {
      value.id = this.idDeliveryTime;
      this.service.updateDeliveryTime(value).pipe(takeUntil(this.unsubscribe$)).subscribe(d => this.onResetForm());
    }
  }

  onResetForm(): void {
    this.edit = false;
    this.editChange.emit(false);
    this.idDeliveryTime = undefined;
    this.timeForm.reset({ saturday: false, sunday: false, active: true });
    this.getDeliveryTimes();
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  deleteTime(d: DeliveryTime): void {
    const confirm = this.dialog.open(MultiDialogComponent, {
      data: { title: 'Confirmar', okAction: 'Aceptar', message: `¿Quieres eliminar el horario ${d.name}?` }
    });
    confirm.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(v => {
      if (v === 1) {
        this.service.deleteDeliveryTime(d.id || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(d => this.getDeliveryTimes());
      }
    });
  }

  onWeekdayChange(e: MatSlideToggleChange, sunday: boolean): void {
    if (!e.checked) {
      return;
    }
    if (sunday) {
      this.timeForm.patchValue({ saturday: false, sunday: e.checked });
    } else {
      this.timeForm.patchValue({ saturday: e.checked, sunday: false });
    }
  }

}
