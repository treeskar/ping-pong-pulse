import { Injectable } from '@angular/core';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { merge } from 'rxjs/observable/merge';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { WindowRefService } from './window-ref.service';
const { version } = require('../../../package.json'); // tslint:disable-line no-var-requires

const GAME_STATUS_MODES = {
  yes: 'playing',
  no: 'idle',
};

@Injectable({
  providedIn: 'root'
})
export class WSService {

  webSocketSubject$: WebSocketSubject<any>;
  status$: BehaviorSubject<{ value: string, date: string }>;
  pulse$: Observable<string>;
  ws$: Subject<any>;
  pastStatus$: Subject<{ value: string, date: string }>;
  latestPulse: string;

  constructor(private windowRef: WindowRefService ) {
    this.pastStatus$ = new Subject();
    this.ws$ = new Subject();

    this.establishConnection();

    this.pulse$ = this.ws$
      .pipe(
        filter((payload) => payload.cmd === 'GAME_STATUS'),
        map((payload) => {
          return GAME_STATUS_MODES[payload.value];
        }),
      );

    // Update page when new version released
    this.ws$
      .pipe(filter((payload) => payload.cmd === 'VERSION' && payload.value !== version))
      .subscribe(() => this.windowRef.nativeWindow.location.reload());

    this.status$ = new BehaviorSubject({ value: 'idle', date: 'Now' });
    merge(
      this.pulse$.pipe(
        filter((status) => this.status$.getValue().date === 'Now'),
        map(value => ({ value, date: 'Now' })),
      ),
      this.pastStatus$,
    ).subscribe(
      (status) => {
        this.status$.next(status);
      }
    );
  }

  establishConnection() {
    const protocol = location.protocol.replace('http', 'ws');
    this.webSocketSubject$ = new WebSocketSubject(`${protocol}//${location.host}/ws`);
    const wsSubscription = this.webSocketSubject$
      .subscribe(
        ({ payload }) => this.ws$.next(payload),
        (error) => {
          wsSubscription.unsubscribe();
          setTimeout(() => {
            this.establishConnection();
          }, 1000 * 30);
        }
      );
  }

  setStatus(date, value: string = this.latestPulse) {
    this.pastStatus$.next({ date, value });
  }
}
