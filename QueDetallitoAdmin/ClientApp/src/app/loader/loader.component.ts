import { AfterViewInit, Component, OnInit } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { fadeLoader } from '../animations';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  animations: [fadeLoader]
})
export class LoaderComponent implements OnInit, AfterViewInit {
  show: Observable<boolean> = EMPTY;

  constructor(private service: LoaderService) { }

  ngAfterViewInit(): void {
    this.show = this.service.show.pipe(delay(0));
  }

  ngOnInit(): void {
    
  }

}
