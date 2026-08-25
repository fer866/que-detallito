import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/common';
import { DateClickArg } from '@fullcalendar/interaction';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GroupCalendar } from 'src/app/entities/calendar';
import { MultiDialogComponent } from '../../components/multi-dialog/multi-dialog.component';
import { ProductionService } from '../../services/production.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  listCalendarYears: number[] = [];
  listCalendar: GroupCalendar[] = [];
  yearSelected?: number;
  currentIndex: number = 0;
  edit: boolean = false;
  calendarOptions: CalendarOptions = {
    locale: 'es',
    initialView: 'dayGridMonth',
    headerToolbar: { left: '', center: '', right: 'title' },
    weekends: true,
    eventClick: this.deleteDay.bind(this),
    editable: true,
    dateClick: this.onDateClick.bind(this),
    contentHeight: 'auto'
  };
  @ViewChild('calendar') calendarComp?: FullCalendarComponent;

  constructor(private service: ProductionService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.service.getCalendarYears().pipe(takeUntil(this.unsubscribe$)).subscribe(y => {
      this.listCalendarYears = y;
      this.yearSelected = y[0];
      this.changeValidRangeDates(y[0]);
      this.getCalendar(y[0]);
    });
  }

  getCalendar(year: number): void {
    this.service.getCalendar(year).pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      this.listCalendar = c;
      this.calendarOptions.events = this.getCalendarEvents();
      this.setInitialDate();
    });
  }

  onYearChange(val: MatSelectChange): void {
    this.changeValidRangeDates(val.value);
    this.getCalendar(val.value);
  }

  changeValidRangeDates(year: number): void {
    this.calendarOptions.validRange = {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    };
  }

  setInitialDate(): void {
    const calendarApi = this.calendarComp?.getApi();
    if (this.edit) {
      return;
    }
    if (this.listCalendar.length > 0) {
      calendarApi?.gotoDate(this.listCalendar[0].groupDate);
    } else {
      calendarApi?.gotoDate(`${this.yearSelected}-01-01`);
    }
  }

  editCalendar(): void {
    if (!this.edit) {
      this.edit = true;
      this.calendarOptions.headerToolbar = { left: 'prev,next', center: '', right: 'title' };
    } else {
      this.edit = false;
      this.calendarOptions.headerToolbar = { left: '', center: '', right: 'title' };
      this.setInitialDate();
    }
  }

  deleteDay(ev: EventClickArg): void {
    const mDialog = this.dialog.open(MultiDialogComponent, {
      data: {
        title: 'Eliminar',
        okAction: 'Aceptar',
        cancelAction: 'Cancelar',
        message: '¿Estás seguro de eliminar el día inhábil?'
      }
    });
    mDialog.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      if (c === 1) {
        this.service.deleteCalendarDay(parseInt(ev.event.id) || 0).pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(() => {
          this.getCalendar(this.yearSelected || 0);
          ev.event.remove();
        });
      }
    })
  }

  changeMonth(forward: boolean): void {
    const calendarApi = this.calendarComp?.getApi();
    if (forward) {
      if (this.listCalendar.length > (this.currentIndex + 1)) {
        this.currentIndex++;
        calendarApi?.gotoDate(this.listCalendar[this.currentIndex].groupDate);
      }
    } else {
      if (this.listCalendar.length >= (this.currentIndex + 1)) {
        this.currentIndex--;
        calendarApi?.gotoDate(this.listCalendar[this.currentIndex].groupDate);
      }
    }
  }

  getCalendarEvents(): EventInput[] {
    const listEvent: EventInput[] = [];
    this.listCalendar.forEach(v => {
      v.calendars.forEach(c => {
        listEvent.push({
          id: c.id?.toString(),
          start: c.calDate?.replace(/T.*$/, ''),
          title: 'inhábil'
        });
      });
    });
    return listEvent;
  }

  onDateClick(d: DateClickArg): void {
    if (!this.edit) {
      return;
    }
    const mDialog = this.dialog.open(MultiDialogComponent, {
      data: {
        title: 'Agregar',
        message: '¿Deseas agregar el día inhábil seleccionado?',
        okAction: 'Agregar',
        cancelAction: 'Cancelar'
      }
    });
    mDialog.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe(c => {
      if (c === 1) {
        this.service.addCalendarDay({ calDate: d.date }).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
          this.getCalendar(this.yearSelected || 0);
        });
      }
    });
  }

}
