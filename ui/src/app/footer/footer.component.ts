import { Component } from '@angular/core';
const { version } = require('../../../package.json'); // tslint:disable-line no-var-requires

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  templateUrl: './footer.component.html'
})
export class FooterComponent {

  public appVersion = version;

}
