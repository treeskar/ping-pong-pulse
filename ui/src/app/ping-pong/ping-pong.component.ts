import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-ping-pong',
  templateUrl: './ping-pong.component.html',
  styleUrls: ['./ping-pong.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PingPongComponent {

  @Input() status = 'loading'; // idle, loading, playing

}
