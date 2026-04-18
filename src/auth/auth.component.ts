import { Component, OnInit } from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";

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
  ) {}

  ngOnInit() {
    this.settings.onTwitchToken((token: string) => {
      console.log("got token:", token);
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
    console.log("start auth process");
    this.settings.startAuth();
  }

  private afterLogin(token: string) {
    this.settings.getUserInfo().subscribe((data: any) => {
      console.log("got data:", data);
      if (!data || !data.data || data.data.length === 0) {
        return;
      }
      console.log(data);

      let userData = {
        token: token,
        username: data.data[0]["display_name"],
        id: data.data[0]["id"],
        desc: data.data[0]["description"],
        created_at: data.data[0]["created_at"],
        profile_image_url: data.data[0]["profile_image_url"],
      };
      this.settings.saveUserData(userData);
      this.settings.checkAccessTokenValidity(token).subscribe((result) => {
        if (result) {
          this.settings.setLoginStatus(true);
        } else {
          alert("Your token is not valid. Try logging in again.");
        }
      });
      console.log("okay going to home");
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
