import { Component, OnInit } from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { ChatComponent } from "../chat/chat.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { DialogBoxComponent } from "../dialog-box/dialog-box.component";
import { SettingsComponent } from "../settings/settings.component";

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
    // Initialisiere den Auth-Prozess
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get("access_token");
        this.settings.setAccessToken(this.accessToken);
        this.settings.getUserInfo().subscribe((data: any) => {
          this.settings.setUserName(data[0]["display_name"]);
          console.log(data);
          this.setAccountData(
            data[0]["description"],
            data[0]["profile_image_url"],
            data[0]["created_at"],
            data[0]["view_count"],
          );
          this.settings
            .checkAccessTokenValidity(this.accessToken)
            .subscribe((result) => {
              console.log("token is valid?", result, this.accessToken);
              if (result) {
                this.settings.setLoginStatus(true);
              } else {
                alert("Your token is not valid. Try logging in again.");
                //this.logout();
              }
            });
          this.router.navigate([""]);
        });
      } else {
        this.startAuthProcess();
      }
    });
  }
  //http://localhost:4200/?error=redirect_mismatch&error_description=Parameter%20redirect_uri%20does%20not%20match%20registered%20URI

  startAuthProcess() {
    const scopes = this.getScopes();
    const url = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200/auth&scope=${scopes}`;
    window.location.href = url;
    //this.settings.openExternalLink(url);
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
