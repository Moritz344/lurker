import { Component } from "@angular/core";

import { FormsModule } from "@angular/forms";
import { SettingsService } from "../services/settings.service";
import { GeneralComponent } from "./general/general.component";
import { AccountComponent } from "./account/account.component";
import { AboutComponent } from "./about/about.component";
import { HotkeysComponent } from "./hotkeys/hotkeys.component";
import { MenubarComponent } from "../menubar/menubar.component";

@Component({
  selector: "app-settings",
  imports: [
    FormsModule,
    GeneralComponent,
    HotkeysComponent,
    AccountComponent,
    AboutComponent,
    MenubarComponent
],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  currentChannel: string = "";
  settingsOption: string = "general";

  constructor(private settings: SettingsService) {}

  onSwitch() {
    this.settings.setCurrentChannel(this.currentChannel);
  }

  onSettings(option: string) {
    this.settingsOption = option;
  }

  onClose() {
    this.settings.closeWindow("settings");
  }
}
