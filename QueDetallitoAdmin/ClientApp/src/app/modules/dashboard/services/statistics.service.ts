import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from 'rxjs';
import { Stat, StatNumbers } from '../components/resume/stat';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private header: HttpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<Stat[]> {
    return this.http.get<Stat[]>('statistics', { headers: this.header }); 
  }

  getStatisticsNumbers(opt: number): Observable<StatNumbers[]> {
    return this.http.get<StatNumbers[]>(`statistics/getNumbers/${opt}`, { headers: this.header });
  }
}
