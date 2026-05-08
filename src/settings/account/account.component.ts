import { Component, OnInit } from "@angular/core";
import { SettingsService } from "../../services/settings.service";
import { TwitchChatService } from "../../services/twitchChat.service";
import { FormsModule } from "@angular/forms";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";

// TODO: implement adding multiple accounts / removing accounts

@Component({
  selector: "app-account",
  imports: [FormsModule],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.css",
})
export class AccountComponent implements OnInit {
  public username: string = "";
  public account_description: any;
  public account_profile_picture: any;
  public account_view_count: any;
  public account_created_at: any;
  public currentSelected: any;

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


  onAddAccount() {
  }

  onRemoveAccount() {}

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.username = "";
  }
}
