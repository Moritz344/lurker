import { Routes } from "@angular/router";
import { AppComponent } from "../app/app.component";
import { SettingsComponent } from "../settings/settings.component";
import {AboutComponent } from "../settings/about/about.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { AuthComponent } from "../auth/auth.component";
import { UserCardComponent } from "../user-card/user-card.component";
import { HomeComponent } from "../home/home.component";

export const routes: Routes = [
  { path: "", component: HomeComponent},
  { path: "settings", component: SettingsComponent },
  { path: "auth", component: AuthComponent },
  { path: "user", component: UserCardComponent},
];
