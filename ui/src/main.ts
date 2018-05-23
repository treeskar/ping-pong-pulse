import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// use the require method provided by webpack
declare const require;

const providers = [];
if (environment.production) {
  enableProdMode();
} else {
  // we use the webpack raw-loader to return the content as a string
  const translations = require(`raw-loader!./locale/messages.en-US.xlf`);
  providers.push({ provide: TRANSLATIONS, useValue: translations });
  providers.push({ provide: TRANSLATIONS_FORMAT, useValue: 'xlf' });
}

platformBrowserDynamic().bootstrapModule(AppModule, { providers })
  .catch(err => console.log(err));
