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
  // TODO: Show user desc,pfp,etc
  username: string = "";
  account_description: any;
  account_profile_picture: any;
  account_view_count: any;
  account_created_at: any;

  constructor(
    private settings: SettingsService,
    private chat: TwitchChatService,
    private router: Router,
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
    this.router.navigate(["auth"]);
  }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.username = "";
  }
}
