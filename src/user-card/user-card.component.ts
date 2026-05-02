import { Component, Input, OnInit, OnDestroy, OnChanges } from "@angular/core";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MenubarComponent } from "../menubar/menubar.component";

@Component({
  selector: "app-user-card",
  imports: [CommonModule, FormsModule,MenubarComponent],
  templateUrl: "./user-card.component.html",
  styleUrl: "./user-card.component.css",
})
export class UserCardComponent implements OnInit, OnDestroy {
  title = "";
  account_creation: string = "";
  infos: any;
  userData: any;
  messages: [{ name: any; date: string; msg: any }] = [
    { name: "", date: "", msg: "" },
  ];
  isBlocked: boolean = false;

  constructor(
    public settings: SettingsService,
    public chat: TwitchChatService,
  ) {
    const b: any = localStorage.getItem("next-user-card");
    const settingsJson = JSON.parse(b);
    this.infos = settingsJson;
    this.account_creation = new Date(
      this.infos.created_at,
    ).toLocaleDateString();
    this.startChat();
  }

  onUserCard() {
    this.settings.openExternalLink(
      "https://twitch.tv/popout/norman/viewercard/" + this.infos.display_name,
    );
  }

  async initUserData() {
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();
    this.userData = {
      token: token,
      id: user_id,
    };
  }

  onExit() {
    this.settings.closeWindow("user-card");
  }

  async startChat() {
    await this.initUserData();
    await this.checkIfUserIsBlocked();
    const username: any = this.infos.display_name;
    let channel: any = localStorage.getItem("channel");
    if (!channel) {
      channel = username;
    }
    this.chat.connect(this.userData.token, username, channel);
    let msgSubject = this.chat.messages$.subscribe((msg) => {
      if (msg.text.split(":")[0] == username.toLowerCase()) {
        this.infos.last_message = msg.text.split(":")[1];
        let today = new Date();
        let dateString = today.getHours() + ":" + today.getMinutes();
        this.messages.push({
          name: this.infos.display_name,
          date: dateString,
          msg: this.infos.last_message,
        });
      }
    });
  }

  async checkIfUserIsBlocked() {
    this.chat
      .getUserBlockList(this.userData.token, this.userData.id)
      .subscribe((response: any) => {
        let data = response.data;
        data.forEach((user: any) => {
          if (user.user_login == this.infos.login) {
            this.isBlocked = true;
          }
        });
      });
  }

  async onUnblockUser() {
    this.chat
      .unblockUser(this.userData.token, this.infos.id)
      .subscribe((response: any) => {
        this.isBlocked = false;
      });
  }

  async onBlockUser() {
    this.chat
      .blockUser(this.infos.id, this.userData.token)
      .subscribe((response: any) => {
        this.isBlocked = true;
      });
  }

  onCopyUserId() {
    this.settings.copyTextToClipboard(this.infos.id);
  }

  ngOnDestroy() {
    localStorage.removeItem("next-user-card");
  }

  ngOnInit() {}
}
