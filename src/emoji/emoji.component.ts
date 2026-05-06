import { Component, OnInit } from '@angular/core';
import { TwitchChatService } from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { MenubarComponent } from '../menubar/menubar.component';

@Component({
  selector: 'app-emoji',
  imports: [CommonModule, FormsModule,MenubarComponent],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.css'
})
export class EmojiComponent implements OnInit {
  public currentTab: string = "global";
  public globalEmotes: any;
  public searchValue: string = "";
  public showEmojiDesc: boolean = false;

  public hoverEmojiName: string = "";
  public hoverEmojiUrl: string = "";
  public hoverX: number = 0;
  public hoverY: number = 0;

  public channelEmotes: any;
  public isLoading: boolean = true;

  constructor(public chat: TwitchChatService,
    public settings: SettingsService) {
    this.initGlobalEmotesData();
    this.initChannelEmotes();
  }

  onExit() {
    this.settings.closeWindow("emoji");
  }

  async initChannelEmotes() {
    this.isLoading = true;
    const token = await this.settings.getToken();
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.getChannelEmotes(id, token).subscribe((response: any) => {
      this.channelEmotes = response.data;
      this.checkForAnimatedFormatAndSetIt(this.channelEmotes);
      this.isLoading = false;
    });
  }

  checkForAnimatedFormatAndSetIt(emojiArray: any) {
      for (let i=0;i<emojiArray.length;i++) {
        const emote = emojiArray[i];
        if (emote["format"].includes('animated')) {
          const parts = emote.images.url_1x.split('/');
          parts[6] = 'animated';
          emote.images.url_1x = parts.join('/');
        }
      }
  }

  async initGlobalEmotesData() {
    const token = await this.settings.getToken();
    this.chat.getGlobalEmotes(token).subscribe((response: any) => {
      this.globalEmotes = response.data;
      this.checkForAnimatedFormatAndSetIt(this.globalEmotes);
      this.isLoading = false;
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
