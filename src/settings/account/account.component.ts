import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../services/settings.service";
import { TwitchChatService } from "../../services/twitchChat.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-account",
  imports: [],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.css",
})
export class AccountComponent implements OnInit {
  username: string = "";
  account_description: any;
  account_profile_picture: any;
  account_view_count: any;
  account_created_at: any;

  constructor(
    private settings: SettingsService,
    private chat: TwitchChatService,
    private router: Router,
  ) { }

  async ngOnInit() {
    const name = await this.settings.getStoredUsername();
    if (name) {
      this.username = name;
    }
    this.account_description = await this.settings.getStoredDesc();
    this.account_profile_picture = await this.settings.getStoredProfileImageUrl();
    this.account_created_at = await this.settings.getStoredCreatedAt();
    this.account_created_at = new Date(this.account_created_at).toLocaleDateString();
  }

  onLogin() {
    this.router.navigate(["auth"]);
  }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.username = "";
  }
}
