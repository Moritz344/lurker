import { Component, OnInit } from '@angular/core';
import { TwitchChatService } from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-emoji',
  imports: [CommonModule, FormsModule],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.css'
})
export class EmojiComponent implements OnInit {

  currentTab: string = "global";
  globalEmotes: any;
  searchValue: string = "";
  showEmojiDesc: boolean = false;

  hoverEmojiName: string = "";
  hoverEmojiUrl: string = "";
  hoverX: number = 0;
  hoverY: number = 0;

  channelEmotes: any;

  constructor(public chat: TwitchChatService,
    public settings: SettingsService) {
    this.initGlobalEmotesData();
    this.initChannelEmotes();
  }

  async initChannelEmotes() {
    const token = await this.settings.getToken();
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.getChannelEmotes(id, token).subscribe((response: any) => {
      this.channelEmotes = response.data;
    });
  }

  async initGlobalEmotesData() {
    const token = await this.settings.getToken();
    this.chat.getGlobalEmotes(token).subscribe((response: any) => {
      this.globalEmotes = response.data;
    });

  }


  ngOnInit() {
  }

  onEmote(name: string) {
    this.chat.setEmoji(name);
  }

  onGlobalTab() {
    this.currentTab = "global";
  }

  onEmojiTab() {
    this.currentTab = "emoji";
  }

  onChannelTab() {
    this.currentTab = "Channel_Emotes";
  }

  OnMouseEnterGlobal(name: string, url: string) {
    this.hoverEmojiName = name;
    this.hoverEmojiUrl = url;
    this.showEmojiDesc = true;

  }


  OnMouseLeaveGlobal() {
    this.showEmojiDesc = false;
  }

  updateHoverPositionGlobal(event: MouseEvent) {
    const offsetX = 50;
    const offsetY = 100;

    this.hoverX = event.pageX - offsetX;
    this.hoverY = event.pageY - offsetY;


    if (this.hoverX >= 500) {
      this.hoverX -= 50;
    }

    if (this.hoverX <= 0) {
      this.hoverX += 50;
    }

  }


}
