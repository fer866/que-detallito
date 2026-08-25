import { ViewportScroller } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Delivery } from 'src/app/entities/user';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/modules/shared/components/confirm-dialog/confirm-dialog.component';
import { BackendApiService } from 'src/app/services/backend-api.service';
import { } from "google.maps";
import { Loader } from "@googlemaps/js-api-loader";

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  updateForm: boolean = false;
  showForm: boolean = false;
  deliveries: Observable<Delivery[]> = EMPTY;
  suburbList: string[] = [];
  @Input() selectable: boolean = false;
  @Output() addressChange: EventEmitter<number> = new EventEmitter();

  addressForm = new FormGroup({
    idDelivery: new FormControl(0),
    alias: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    nameDelivery: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(28)]),
    zipCode: new FormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(5), Validators.pattern('^[0-9]*$')]),
    state: new FormControl({ value: '', disabled: true }, [Validators.required]),
    town: new FormControl({ value: '', disabled: true }, [Validators.required, Validators.minLength(5)]),
    suburb: new FormControl('', [Validators.required, Validators.minLength(3)]),
    street: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)]),
    number: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(8)]),
    specialAddress: new FormControl('', [Validators.minLength(5), Validators.maxLength(60)]),
    longitude: new FormControl(),
    latitude: new FormControl()
  });
  map?: google.maps.Map;
  @ViewChild('map', { static: false }) mapElement?: ElementRef;
  marker?: google.maps.Marker;

  constructor(
    private service: BackendApiService,
    private snack: MatSnackBar,
    private dialog: MatDialog,
    private viewPort: ViewportScroller
  ) { }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.getDeliveries();
    this.initZipCodeData();
    this.addressForm.statusChanges.pipe(
      debounceTime(1000),
      filter(() => this.addressForm.valid),
      takeUntil(this.unsubscribe$)
    ).subscribe(a => this.onAddressValid());
  }

  getDeliveries(): void {
    this.deliveries = this.service.getDeliveries().pipe(shareReplay(1));
    if (this.selectable) {
      this.deliveries.pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
        if (d.length > 0) {
          this.addressChange.emit(d[0].idDelivery)
        }
      });
    }
  }
  
  initZipCodeData(): void {
    this.addressForm.controls.zipCode.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (term && this.addressForm.controls.zipCode.valid) {
          return this.service.getZipCodeData(term);
        } else {
          return EMPTY;
        }
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe(data => {
      this.suburbList = data.response.asentamiento;
      this.addressForm.patchValue({ state: data.response.estado, town: data.response.municipio });
    }, error => {
      this.addressForm.patchValue({ state: null, town: null, zipCode: null, suburb: null });
      this.suburbList = [];
    });
  }

  addressSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAsTouched();
      return;
    }
    const value = this.addressForm.getRawValue();
    if (this.updateForm) {
      this.service.updateDelivery(value).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        this.resetForm(res.message);
      })
    } else {
      this.service.addDelivery(value).pipe(takeUntil(this.unsubscribe$)).subscribe(res => {
        this.resetForm(res.message);
      });
    }
  }

  resetForm(message?: string): void {
    this.addressForm.reset();
    this.showForm = this.updateForm = false;
    this.map = this.marker = undefined;
    this.getDeliveries();
    this.viewPort.setOffset([0, 164]);
    this.viewPort.scrollToAnchor('addressTop');
    if (message) {
      this.snack.open(message, 'descartar', { duration: 7000 });
    }
  }

  onSelectedValue(val: MatSelectionListChange): void {
    if (val.options[0].value) {
      this.addressChange.emit(val.options[0].value);
    } else {
      this.addressChange.emit();
    }
  }

  onShowForm(): void {
    this.showForm = true;
    this.addressChange.emit();
  }

  editForm(val: Delivery): void {
    this.addressForm.setValue(val);
    this.showForm = this.updateForm = true;
    this.addressChange.emit();
  }

  deleteDelivery(val: Delivery): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogData('Confirmar', `¿Está seguro de eliminar la dirección ${val.alias}?`)
    });
    dialogRef.afterClosed().pipe(takeUntil(this.unsubscribe$)).subscribe((c: ConfirmDialogData) => {
      if (c && c.action === 'confirm') {
        this.service.deleteDelivery(val.idDelivery || 0).pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
          this.getDeliveries();
          this.addressChange.emit();
          this.snack.open(d.message, 'descartar', { duration: 7000 });
        });
      }
    });
  }

  getAddressName(del: Delivery): string {
    return del.street + ' ' + del.number?.toString() + ', ' + del.suburb + ', ' + del.town + ', ' + del.state;
  }

  onAddressValid(): void {
    if (this.mapElement) {
      let latlng: any = null;
      const form = this.addressForm.getRawValue();
      if (form.latitude) {
        latlng = { lat: form.latitude, lng: form.longitude };
      } else {
        latlng = { lat: 19.5141799, lng: -99.2491551 };
      }
      if (!this.map) {
        this.initMap(latlng, form);
      } else {
        this.map.setCenter(latlng);
        if (form.latitude) {
          this.initMarker(latlng);
        } else {
          this.initGeocoder(latlng, form);
        }
      }
    }
  }

  initMap(latlng: any, form: any): void {
    if (this.mapElement) {
      const loader = new Loader({
        apiKey: 'AIzaSyCxOQeespv7CodggHYoVDyRNNt6-cHqh1w',
        version: 'weekly'
      });
      loader.load().then(() => {
        this.map = new google.maps.Map(this.mapElement?.nativeElement, {
          center: latlng,
          zoom: 19,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        if (form.latitude) {
          this.initMarker(latlng);
        } else {
          this.initGeocoder(latlng, form);
        }
      });
    }
  }

  initGeocoder(latlng: any, form: any): void {
    const address: string = `${form.street} ${form.number},${form.suburb},${form.zipCode},${form.town},${form.state}`;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0].geometry && results[0].geometry.location) {
          const val = results[0].geometry.location;
          this.addressForm.patchValue({ longitude: val?.lng(), latitude: val?.lat() });
          this.map?.setCenter(val);
          this.initMarker(val);
        } else {
          this.initMarker(latlng);
        }
      }
    });
  }

  initMarker(pos: any): void {
    if (this.marker) {
      this.marker.setPosition(pos);
    } else {
      this.marker = new google.maps.Marker({ map: this.map, position: pos, draggable: true });
      this.marker.addListener('dragend', () => {
        const val = this.marker?.getPosition();
        this.addressForm.patchValue({ longitude: val?.lng(), latitude: val?.lat() });
      });
    }
  }
}
