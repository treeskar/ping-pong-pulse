import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { StatusService } from '../status.service';

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
  };

  get date() {
    return this.cacheDate;
  }

  constructor(private statusService: StatusService) {}

  goBack() {
    this.statusService.setStatus('Now');
  }
}
