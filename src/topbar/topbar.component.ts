import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { SettingsComponent } from "../settings/settings.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: "app-topbar",
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatButtonModule,
    SettingsComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: "./topbar.component.html",
  styleUrl: "./topbar.component.css",
})
export class TopbarComponent {
  currentChannel: string = "";
  showLoginButton: boolean = true;

  constructor(
    private dialog: MatDialog,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private router: Router,
  ) {
    this.settings.getLoginStatus().subscribe((result) => {
      if (result) {
        this.showLoginButton = false;
      }
    });
  }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.showLoginButton = true;
  }

  onSettings() {
    this.dialog.open(SettingsComponent, {
      width: "500px",
      panelClass: "container",
    });
  }

  onSwitchChannel() {
    this.settings.setCurrentChannel(this.currentChannel);
  }

  onLogin() {
    this.router.navigate(["auth"]);
  }
}
