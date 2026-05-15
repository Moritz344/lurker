import { Component, OnInit,ViewChild } from '@angular/core';
import { TwitchChatService } from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { MenubarComponent } from '../menubar/menubar.component';

// TODO: Show loading animation for every emoji group
// TODO: lazy load emojis => show button Load more

@Component({
  selector: 'app-emoji',
  imports: [CommonModule, FormsModule,MenubarComponent],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.css'
})
export class EmojiComponent implements OnInit {
  @ViewChild("hoverContainer") hoverContainer: any;
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

  public seventvGlobal: any[] = [];
  public seventvChannel: any[] = [];

  constructor(public chat: TwitchChatService,
    public settings: SettingsService) {
    this.initGlobalEmotesData();
    this.initChannelEmotes();
    this.initBetterTTVGlobal();
    this.init7tvGlobal();
    this.init7tvChannel();
    this.initBetterTTVChannel();
  }

  onExit() {
    this.settings.closeWindow("emoji");
  }

  initBetterTTVGlobal() {
    this.chat.getBetterTTVGlobal().subscribe( (response: any) => {
      this.betterttvGlobal = response.map( (x: any) => ({
        name: x.code,
        url_1x: "https://cdn.betterttv.net/emote/" + x.id + "/1x." + x.imageType,
        url_2x: "https://cdn.betterttv.net/emote/" + x.id + "/2x." + x.imageType
      }));
    });
  }

  init7tvChannel() {
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.get7tvChannel(id).subscribe( (response: any) => {
      console.log(response);
      this.seventvChannel = response.emote_set.emotes.map( (x: any) => ({
        name: x.name,
        url_1x:  "https:" + x.data.host.url + "/" + x.data.host.files[0].name,
        url_2x:  "https:" + x.data.host.url + "/" + x.data.host.files[1].name,
      }));
    });

  }

  init7tvGlobal() {
    this.chat.get7tvGlobal().subscribe( (response: any) => {
      this.seventvGlobal = response.emotes.map( (x: any) => ({
        name: x.name,
        url_1x:  "https:" + x.data.host.url + "/" + x.data.host.files[0].name,
        url_2x:  "https:" + x.data.host.url + "/" + x.data.host.files[1].name,
      }));
    });

  }

  initBetterTTVChannel() {
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.getBetterTTVChannel(id).subscribe( (response: any) => {
      this.betterttvChannel = response.channelEmotes.map( (x: any) => ({
        name: x.code,
        url_1x: "https://cdn.betterttv.net/emote/" + x.id + "/1x." + x.imageType,
        url_2x: "https://cdn.betterttv.net/emote/" + x.id + "/2x." + x.imageType
      }));
    });
  }

  async initChannelEmotes() {
    this.isLoading = true;
    const id: any = localStorage.getItem("broadcaster_id");
    const token = await this.settings.getToken();

    this.chat.getChannelEmotes(id,token).subscribe((response: any) => {
      this.channelEmotes = response.data.map( (x: any) => ({
        name: x.name,
        url_1x: x.images.url_1x,
        url_2x: x.images.url_2x,
        format: x.format
      }));
      this.checkForAnimatedFormatAndSetIt(this.channelEmotes);
      this.isLoading = false;
    });
  }

  checkForAnimatedFormatAndSetIt(emojiArray: any) {
    for (const emote of emojiArray) {
      if (emote.format.includes('animated')) {
        const parts = emote.url_1x.split('/');
        parts[6] = 'animated';
        emote.url_1x = parts.join('/');
      }
    }
  }

  async initGlobalEmotesData() {
    const token = await this.settings.getToken();
    this.chat.getGlobalEmotes(token).subscribe((response: any) => {
      this.globalEmotes = response.data.map( (x: any) => ({
        name: x.name,
        url_1x: x.images.url_1x,
        url_2x: x.images.url_2x,
        format: x.format
      }));
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
    const offsetX = 60;
    const offsetY = 20;

    const spaceRight = window.innerWidth - event.pageX;
    const spaceBelow = window.innerHeight - event.pageY;

    this.hoverX = event.pageX + offsetX;
    this.hoverY = event.pageY + offsetY;

    const rect = this.hoverContainer.nativeElement.getBoundingClientRect();

    if (spaceRight >= rect.width + offsetX) {
      this.hoverX = event.pageX + offsetX;
    } else {
      this.hoverX = event.pageX - rect.width - offsetX;
    }

    if (spaceBelow >= rect.height + offsetY) {
      this.hoverY = event.pageY + offsetY;
    } else {
      this.hoverY = event.pageY - rect.height - offsetY;
    }



  }


}
