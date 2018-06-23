import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TimeLineService {

  public data$: any;

  constructor(private http: HttpClient) {
    this.data$ = this.http.get(`/api/stats?range=24`).pipe(share());
  }
}
