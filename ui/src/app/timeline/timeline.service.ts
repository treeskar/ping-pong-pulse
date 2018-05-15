import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

@Injectable({
  providedIn: 'root'
})
export class TimeLineService {

  data$: Observable<any>;

  constructor(private http: HttpClient) {
    this.data$ = this.http
      .get(`/api/stats?range=24`)
      .pipe(
        map((response) => {
          console.log(response);
          return response;
        })
      );
  }
}
