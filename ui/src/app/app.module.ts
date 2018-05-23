import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { TimeLineComponent } from './timeline/timeline.component';
import { PingPongComponent } from './ping-pong/ping-pong.component';
import { StatusComponent } from './status/status.component';
import { PingStatusPipe } from './ping-status.pipe';
import { environment } from '../environments/environment';

const providers = [];
if (!environment.production) {
  providers.push({ provide: LOCALE_ID, useValue: 'en-US' });
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    TimeLineComponent,
    PingPongComponent,
    StatusComponent,
    PingStatusPipe,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers,
  bootstrap: [AppComponent],
})
export class AppModule { }
