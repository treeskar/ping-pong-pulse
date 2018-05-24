import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { startWith, pluck } from 'rxjs/operators';

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
        pluck('value'),
        startWith('loading'),
      );

    this.date$ = statusService.status$.pipe(
      pluck('date'),
      startWith('Now'),
    );
  }
}
