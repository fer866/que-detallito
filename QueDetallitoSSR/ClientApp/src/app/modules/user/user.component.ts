import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EMPTY, Observable } from 'rxjs';
import { User } from 'src/app/entities/user';
import { BackendApiService } from 'src/app/services/backend-api.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: Observable<User> = EMPTY;

  constructor(private title: Title, private service: BackendApiService) { }

  ngOnInit(): void {
    this.title.setTitle('Que Detallito | Mi Cuenta');
    this.user = this.service.getUserData();
  }

}
