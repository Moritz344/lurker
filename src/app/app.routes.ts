import { Routes } from "@angular/router";
import { AppComponent } from "../app/app.component";
import { SettingsComponent } from "../settings/settings.component";
import {AboutComponent } from "../settings/about/about.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { AuthComponent } from "../auth/auth.component";

export const routes: Routes = [
  { path: "settings", component: SettingsComponent },
  { path: "auth", component: AuthComponent },
];
