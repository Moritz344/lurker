import { Component, OnInit } from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";

// TODO: auth => lurker homepage => auth => user copys user data => paste into settings and save them

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
    this.settings.setAccessToken(token);
    this.settings.getUserInfo().subscribe((data: any) => {
      this.settings.setUserName(data[0]["display_name"]);
      this.setAccountData(
        data[0]["description"],
        data[0]["profile_image_url"],
        data[0]["created_at"],
        data[0]["view_count"],
      );
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

  setAccountData(
    desc: string,
    image_url: string,
    created_at: string,
    view_count: number,
  ): void {
    localStorage.setItem("description", desc);
    localStorage.setItem("profile_image_url", image_url);
    localStorage.setItem("created_at", created_at);
    localStorage.setItem("view_count", view_count.toString());
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
