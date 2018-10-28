import { Injectable } from '@angular/core';
import { map, filter, withLatestFrom } from 'rxjs/operators';
import { Observable ,  merge ,  BehaviorSubject ,  Subject } from 'rxjs';
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
  status$: BehaviorSubject<{ data: string, date: string }>;
  pulse$: Observable<{ data: string, date: string }>;
  ws$: Subject<any>;
  setStatus$: Subject<{ data: string, date: string }>;

  constructor(private windowRef: WindowRefService ) {
    this.setStatus$ = new Subject();
    this.ws$ = new Subject();

    this.establishConnection();

    this.pulse$ = this.ws$
      .pipe(
        filter((payload) => payload.cmd === 'GAME_STATUS'),
        map((payload) => ({
          date: 'Now',
          data: GAME_STATUS_MODES[payload.value],
        })),
      );

    // Update page when new version released
    this.ws$
      .pipe(filter((payload) => payload.cmd === 'VERSION' && payload.value !== version))
      .subscribe(() => this.windowRef.nativeWindow.location.reload());

    this.status$ = new BehaviorSubject({ data: 'idle', date: 'Now' });
    merge(
      this.pulse$,
      this.setStatus$.pipe(
        withLatestFrom(this.pulse$, (tick, pulse) => tick.date === 'Now' ? pulse : tick),
      ),
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
          if (wsSubscription) {
            wsSubscription.unsubscribe();
          }
          setTimeout(() => {
            this.establishConnection();
          }, 1000 * 30);
        }
      );
  }

  setStatus(date, data: string = this.status$.value.data) {
    this.setStatus$.next({ date, data });
  }
}
