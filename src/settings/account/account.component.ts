import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../services/settings.service";
import { TwitchChatService } from "../../services/twitchChat.service";

@Component({
  selector: "app-account",
  imports: [],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.css",
})
export class AccountComponent implements OnInit {
  // TODO: Show user desc,pfp,etc
  username: string = "";
  account_description: any;
  account_profile_picture: any;
  account_view_count: any;
  account_created_at: any;

  constructor(
    private settings: SettingsService,
    private chat: TwitchChatService,
  ) {}

  ngOnInit() {
    this.settings.getUserName().subscribe((name) => {
      if (name) {
        this.username = name;
      }
    });
    this.account_description = localStorage.getItem("description");
    this.account_profile_picture = localStorage.getItem("profile_image_url");
    this.account_view_count = localStorage.getItem("view_count");
    this.account_created_at = localStorage.getItem("created_at");
  }

  onLogin() {
    this.settings.setLoginStatus(true);
    const url =
      "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200&scope=chat:read user:write:chat";
    window.location.href = url;
  }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.username = "";
  }
}
