import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// TODO: show multiple messages 

@Component({
  selector: 'app-user-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit, OnDestroy {

  title = "";
  account_creation: string = "";
  infos: any;
  messages: [{ name: any, date: string, msg: any }] = [{ name: "", date: "", msg: "" }];


  constructor(public settings: SettingsService, public chat: TwitchChatService) {
    const b: any = localStorage.getItem("next-user-card");
    const settingsJson = JSON.parse(b);
    this.infos = settingsJson;
    this.account_creation = new Date(this.infos.created_at).toLocaleDateString();
    this.startChat();
  }


  onUserCard() {
    this.settings.openExternalLink("https://twitch.tv/popout/norman/viewercard/" + this.infos.display_name);
  }

  async startChat() {
    const token = await this.settings.getToken();
    const username: any = this.infos.display_name;
    let channel: any = localStorage.getItem("channel");
    if (!channel) {
      channel = username;
    }
    this.chat.connect(token, username, channel);
    let msgSubject = this.chat.messages$.subscribe((msg) => {
      if (msg.split(":")[0] == username.toLowerCase()) {
        this.infos.last_message = msg.split(":")[1];
        let today = new Date();
        let dateString = today.getHours() + ":" + today.getMinutes();
        this.messages.push({ name: this.infos.display_name, date: dateString, msg: this.infos.last_message });
      };
    });

  }


  ngOnDestroy() {
    localStorage.removeItem("next-user-card");
  }

  ngOnInit() {
  }



}
