import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  @Input() email: string;
  @Input() subject = 'Ping Pong Pulse: feature request/bug report';
  @Input() cc = '';

  link: string;

  ngOnInit() {
    const extraData = { subject: this.subject, cc: this.cc };
    const postfix = Object.entries(extraData)
      .filter(([ key, value ]) => value)
      .map(([ key, value ]) => `${key}=${value}`)
      .join('&');
    this.link = `mailto:${this.email}?${postfix}`;
  }
}
