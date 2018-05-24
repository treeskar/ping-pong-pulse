import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WSService } from '../ws.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusComponent {

  cacheDate: string;
  isNow = true;

  @Input() status: string;
  @Input() set date(value) {
    this.isNow = !value || value === 'Now';
    this.cacheDate = value;
  }

  get date() {
    return this.cacheDate;
  }

  constructor(private statusService: WSService) {}

  goBack() {
    this.statusService.setStatus('Now');
  }
}
