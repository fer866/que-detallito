import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { fade } from 'src/app/animations';
import { User } from 'src/app/entities/user';
import { BackendApiService } from 'src/app/services/backend-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  animations: [fade]
})
export class UserComponent implements OnInit {
  user: Observable<User> = EMPTY;

  constructor(private title: Title, private service: BackendApiService) { }

  ngOnInit(): void {
    this.title.setTitle('Que Detallito | Mi Cuenta');
    this.user = this.service.getUserData();
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.b;
  }

}
