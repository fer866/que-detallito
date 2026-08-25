import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PromptUpdateService {
  private unsubscribe$ = new Subject();

  constructor(updates: SwUpdate) {
    updates.available.pipe(takeUntil(this.unsubscribe$)).subscribe(event => {
      alert('Existe una nueva versión, la aplicación se reiniciará');
      updates.activateUpdate().then(() => document.location.reload());
    })
  }
}
