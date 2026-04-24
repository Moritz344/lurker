import { Component, inject, OnInit } from "@angular/core";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: "app-about",
  imports: [],
  templateUrl: "./about.component.html",
  styleUrl: "./about.component.css",
})
export class AboutComponent implements OnInit {
  public settings = inject(SettingsService);
  public maintainerData: any;
  public version: string = "";

  constructor() {}

  async initData() {
    this.settings.getMaintainer().subscribe((response: any) => {
      this.maintainerData = response;
    });
    this.version = await this.settings.getVersion();
  }

  onOpenExternalLink(link: string) {
    this.settings.openExternalLink(link);
  }
  ngOnInit() {
    this.initData();
  }
}
