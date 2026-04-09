import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app/app.component";
import { importProvidersFrom } from "@angular/core";
import { provideRouter, withHashLocation } from "@angular/router";
import { SettingsComponent } from "./settings/settings.component";
import { AuthComponent } from "./auth/auth.component";
import { TopbarComponent } from "./topbar/topbar.component";
import { routes } from "./app/app.routes";
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(HttpClientModule), provideRouter(routes, withHashLocation(),), provideAnimations()],
});
