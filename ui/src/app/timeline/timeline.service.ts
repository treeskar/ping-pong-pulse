import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeLineService {

  public data$: Observable<any>;

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get(`/api/stats?range=24`);
  }
}
