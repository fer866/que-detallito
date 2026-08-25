import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-address-container',
  template: `
    <h2 class="section-title">
        <mat-icon>local_shipping</mat-icon> Direcciones de envío
    </h2>
    <app-address [selectable]="false"></app-address>
  `,
  styles: [
  ]
})
export class AddressContainerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
