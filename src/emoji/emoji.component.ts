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

  public betterttvGlobal: any[] = [];
  public betterttvChannel: any[] = [] ;

  constructor(public chat: TwitchChatService,
    public settings: SettingsService) {
    this.initGlobalEmotesData();
    this.initChannelEmotes();
    this.initBetterTTVGlobal();
    this.initBetterTTVChannel();
  }

  onExit() {
    this.settings.closeWindow("emoji");
  }

  initBetterTTVGlobal() {
    this.chat.getBetterTTVGlobal().subscribe( (response: any) => {
      this.betterttvGlobal = response;
      for (let i=0;i<this.betterttvGlobal.length;i++) {
        const url_1x = "https://cdn.betterttv.net/emote/" + this.betterttvGlobal[i].id + "/1x." + this.betterttvGlobal[i].imageType;
        const url_2x = "https://cdn.betterttv.net/emote/" + this.betterttvGlobal[i].id + "/2x." + this.betterttvGlobal[i].imageType;
        this.betterttvGlobal[i]["img"] = {
          "1x": url_1x,
          "2x": url_2x
        }
      }
    });
  }
  initBetterTTVChannel() {
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.getBetterTTVChannel(id).subscribe( (response: any) => {
      this.betterttvChannel = response.channelEmotes;
        for (let i=0;i<this.betterttvChannel.length;i++) {
          const url_1x = "https://cdn.betterttv.net/emote/" + this.betterttvChannel[i].id + "/1x." + this.betterttvChannel[i].imageType;
          const url_2x = "https://cdn.betterttv.net/emote/" + this.betterttvChannel[i].id + "/2x." + this.betterttvChannel[i].imageType;
          this.betterttvChannel[i]["img"] = {
            "1x": url_1x,
            "2x": url_2x
          }

      }
    })
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


  onTab(tab: string) {
    switch(tab) {
      case "global":
        this.currentTab = "global"
        break;
      case "channel":
        this.currentTab = "channel";
        break;
      case "betterttv-global":
        this.currentTab = "betterttv-global";
        break;
      case "betterttv-channel":
        this.currentTab = "betterttv-channel";
        break;
      default:
        this.currentTab = "global";
    }


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
