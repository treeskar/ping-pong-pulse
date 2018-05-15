import { Injectable } from '@angular/core';
import { map, filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  status$: BehaviorSubject<{ value: string, date: string }>;
  pulse$: Observable<string>;
  pastStatus$: Subject<{ value: string, date: string }>;
  latestPulse: string;

  constructor() {
    this.pastStatus$ = new Subject();
    const protocol = location.protocol.replace('http', 'ws');
    this.pulse$ = new WebSocketSubject(`${protocol}//${location.host}/ws`)
      .pipe(
        map((event: { payload: string }) => event.payload),
        tap( (pulse) => this.latestPulse = pulse),
      );

    this.status$ = new BehaviorSubject({ value: 'idle', date: 'Now' });
    merge(
      this.pulse$.pipe(
        filter((status) => this.status$.getValue().date === 'Now'),
        map(value => ({ value, date: 'Now' })),
      ),
      this.pastStatus$,
    ).subscribe((status) => {
      this.status$.next(status);
    })
  }

  setStatus(date, value: string = this.latestPulse) {
    this.pastStatus$.next({ date, value });
  }
}
