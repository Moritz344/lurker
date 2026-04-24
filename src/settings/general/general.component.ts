import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../../services/settings.service";
import { TwitchChatService } from "../../services/twitchChat.service";

// TODO: change font size
// TODO: change message timestamp format

@Component({
  selector: "app-general",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.css",
})
export class GeneralComponent implements OnInit {
  chat = inject(TwitchChatService);
  public currentTheme: string = "";
  public currentTimeStampFormat: string = "";
  public currentChatColorState: boolean = true;
  public currentUserColor: string = "";

  customChatColor: boolean = false;
  colorMap: Record<string, string> = {
    "#0000FF": "blue",
    "#8A2BE2": "blue_violet",
    "#5F9EA0": "cadet_blue",
    "#D2691E": "chocolate",
    "#FF7F50": "coral",
    "#1E90FF": "dodger_blue",
    "#B22222": "firebrick",
    "#DAA520": "golden_rod",
    "#008000": "green",
    "#FF69B4": "hot_pink",
    "#FF4500": "orange_red",
    "#FF0000": "red",
    "#2E8B57": "sea_green",
    "#00FF7F": "spring_green",
    "#9ACD32": "yellow_green",
  };
  public username: string = "";

  saveSettings = [{}];

  getColorNameFromHex(hex: string) {
    return this.colorMap[hex.toUpperCase()];
  }

  updateSettings() {
    this.saveSettings = [
      {
        theme: this.currentTheme,
        timeStampFormat: this.currentTimeStampFormat,
        chatColorState:
          this.currentChatColorState == true ? "enabled" : "disabled",
      },
    ];
    localStorage.setItem("settings", JSON.stringify(this.saveSettings));
    this.settings.setTheme(this.currentTheme);
    const settings = localStorage.getItem("settings");
    this.applyUserSettings(settings);
  }

  applyUserSettings(settings: any) {
    const settingsJson = JSON.parse(settings);
  }

  async initData() {
    this.username = await this.settings.getStoredUsername();
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();
    this.settings.getUserColor(token, user_id).subscribe((response: any) => {
      this.currentUserColor = response.data[0]["color"];
    });
  }

  async onChangeUserColor() {
    console.log("change color:" + this.currentUserColor);
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();
    const color = this.getColorNameFromHex(this.currentUserColor);
    this.chat
      .updateUserChatColor(user_id, color, token)
      .subscribe((response: any) => {
        console.log(response);
      });
  }

  loadDefault() {
    const settings: any = localStorage.getItem("settings");
    const settingsJson = JSON.parse(settings);
    if (settingsJson) {
      if (settingsJson[0].chatColorState == "enabled") {
        this.currentChatColorState = true;
      } else {
        this.currentChatColorState = false;
      }

      this.currentTimeStampFormat = settingsJson[0].timeStampFormat;
      this.currentTheme = settingsJson[0].theme;
      this.updateSettings();
    }
  }

  ngOnInit(): void {
    this.settings.getLoginStatus().subscribe((isLoggedIn) => {
      this.loadDefault();
      const settings: any = localStorage.getItem("settings");
      if (settings) {
        this.saveSettings = JSON.parse(settings);
        this.applyUserSettings(settings);
      }
    });
    this.initData();
  }

  constructor(public settings: SettingsService) {}
}
