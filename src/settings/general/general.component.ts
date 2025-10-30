import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../../services/settings.service";

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
  currentTheme: string = "";
  currentFontSize: string = "";
  currentFont: string = "";

  saveSettings = [{}];

  updateSettings() {
    this.saveSettings = [
      {
        theme: this.currentTheme,
        font: this.currentFont,
        fontSize: this.currentFontSize,
      },
    ];
    localStorage.setItem("settings", JSON.stringify(this.saveSettings));
    const settings = localStorage.getItem("settings");
    this.applyUserSettings(settings);
  }

  applyUserSettings(settings: any) {
    const settingsJson = JSON.parse(settings);
    if (settingsJson) {
      document.documentElement.style.setProperty(
        "--default-font",
        settingsJson[0].font,
      );
      document.documentElement.style.setProperty(
        "--default-fontSize",
        settingsJson[0].fontSize,
      );
    }
  }

  loadDefault() {
    const settings: any = localStorage.getItem("settings");
    const settingsJson = JSON.parse(settings);
    if (settingsJson) {
      this.currentFont = settingsJson[0].font;
      this.currentFontSize = settingsJson[0].fontSize;
      this.currentTheme = settingsJson[0].theme;
    }
  }

  ngOnInit(): void {
    this.settings.getLoginStatus().subscribe((result) => {
      if (result) {
        this.loadDefault();
        const settings: any = localStorage.getItem("settings");
        this.saveSettings = settings;
        this.applyUserSettings(this.saveSettings);
      }
    });
  }

  constructor(public settings: SettingsService) {}
}
