import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { startWith, pluck, map } from 'rxjs/operators';

import { WSService } from './ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  status$: Observable<string>;
  date$: Observable<string>;

  constructor(public statusService: WSService) {
    this.status$ = statusService.status$
      .pipe(
        map(({ data }) => data),
        startWith('loading'),
      ) as Observable<string>;

    this.date$ = statusService.status$.pipe(
      map(({ date }) => date),
      startWith('Now'),
    ) as Observable<string>;
  }
}
