import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClientModule),
		 provideRouter([
      { path: '', component: AppComponent}
    ])
  ]
});
