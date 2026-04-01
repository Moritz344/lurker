import { Component, OnInit } from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";

// TODO: dont store in localStorage use electron-store

@Component({
  selector: "app-auth",
  standalone: true,
  imports: [],
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.css",
})
export class AuthComponent implements OnInit {
  private loginSub?: Subscription;
  private getLoginSub?: Subscription;
  loginStatus: boolean = true;
  placeholderString: string = "";
  accessToken: any;

  loginDataToCopy: string = "";

  constructor(
    public settings: SettingsService,
    public chat: TwitchChatService,
    public route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.settings.onTwitchToken((token: string) => {
      this.accessToken = token;
      this.afterLogin(token);
    });

    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get("access_token");
        this.afterLogin(this.accessToken);
      } else {
        this.startAuthProcess();
      }
    });
  }

  startAuthProcess() {
    this.settings.startAuth();
  }

  private afterLogin(token: string) {
    this.settings.getUserInfo().subscribe((data: any) => {
      let userData = {
        token: token,
        username: data[0]["display_name"],
        id: data[0]["id"],
        desc: data[0]["description"],
        created_at: data[0]["created_at"],
        profile_image_url: data[0]["profile_image_url"],
      }
      this.settings.saveUserData(userData);
      this.settings
        .checkAccessTokenValidity(token)
        .subscribe((result) => {
          if (result) {
            this.settings.setLoginStatus(true);
          } else {
            alert("Your token is not valid. Try logging in again.");
          }
        });
      this.router.navigate([""]);
    });
  }

  getScopes(): string {
    return [
      "chat:edit",
      "moderator:manage:announcements",
      "moderation:read",
      "moderator:read:chatters",
      "channel:manage:moderators",
      "channel:manage:polls",
      "user:write:chat",
      "chat:read",
      "user:read:follows",
    ].join(" ");
  }
}
