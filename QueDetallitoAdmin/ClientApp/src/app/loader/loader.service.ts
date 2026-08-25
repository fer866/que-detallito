import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _showLoader = new BehaviorSubject<boolean>(false);
  show = this._showLoader.asObservable();

  constructor() { }

  change(val: boolean): void {
    this._showLoader.next(val);
  }
}
