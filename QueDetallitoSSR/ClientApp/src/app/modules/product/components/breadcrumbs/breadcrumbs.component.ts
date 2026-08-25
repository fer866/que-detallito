import { Component, Input, OnInit } from '@angular/core';
import { Product } from 'src/app/entities/product';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  @Input() product?: Product;

  constructor() { }

  ngOnInit(): void {
  }

}
