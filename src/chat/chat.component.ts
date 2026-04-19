import { Component, Input, OnInit, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SettingsService } from "../services/settings.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { RouterModule, } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComponentFactoryResolver, Injector } from '@angular/core';
import { UserCardComponent } from '../user-card/user-card.component';
import { TwitchChatService } from '../services/twitchChat.service';
import { DomSanitizer, SafeUrl, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: "app-chat",
  imports: [CommonModule, FormsModule, RouterModule, UserCardComponent],
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.css",
})
export class ChatComponent implements OnInit {
  @Input() message: string = "";
  @Input() color: string = "";
  @Input() badges: any;
  @Input() emojis: { name: string, url: string, url_2: string }[] = [];
  @Input() emojisChannel: any;
  @ViewChild('container') containerDiv!: ElementRef;


  title = "Lurker"
  currentDate: string = "";
  currentName: string = "";
  currentMessage: string = "";
  currentBadges: any;
  emojiSet: Set<string> = new Set();
  foundEmotes: any;
  emojiIndex: number = 0;
  emoteMessage: string[] = [];
  userColor: string = "white";
  emoteHTML: string[] = [];
  currentEmoteHoverIndex: number = 0;
  currentHoverEmoteName = "";

  showGlobalEmojiDesc: boolean = false;
  hoverEmojiGlobalX = 0;
  hoverEmojiGlobalY = 0;
  processedMessageEmoji: string[] = [];
  hoverEmoji: string = "";
  userToListenTo: string = "";

  showBadge: boolean = false;
  hoverBadgeX = 0;
  hoverBadgeY = 0;
  currentHoverBadge: { title: string, img: SafeUrl } = { title: "", img: "" };
  currentHoverEmote: { title: string, img: SafeUrl } = { title: "", img: "" };

  isReply: boolean = false;
  isMention: boolean = false;

  constructor(public settings: SettingsService,
    public resolver: ComponentFactoryResolver,
    public chat: TwitchChatService,
    public injector: Injector,
    public router: Router,
    private sanitizer: DomSanitizer,
  ) {

  }

  checkIfMentions(msg: string) {
    const username: any = localStorage.getItem("username");
    if (msg.includes("@" + username)) {
      this.isMention = true;
    }
  }

  init() {
    this.checkMessage();
    const splitMessage = this.message.split(":");
    this.checkIfMentions(splitMessage[1]);
    this.currentName = splitMessage[0];
    this.currentMessage = splitMessage[1];
    this.currentBadges = {
      images: this.badges.badgeImages,
      title: this.badges.badges
    };


    let state = this.settings.getUserColorStatus();
    if (state == "disabled") {
      this.userColor = "white";
    } else {
      this.userColor = this.color;
    }

    let timestampFormat = this.settings.getUserTimestampFormat();
    if (timestampFormat == undefined) {
      timestampFormat = "h:mm";
    }

    let minutes;
    if (Number(new Date().getMinutes()) < 10) {
      minutes = "0" + new Date().getMinutes();
    } else {
      minutes = new Date().getMinutes().toString();
    }
    if (timestampFormat !== "disabled") {
      this.currentDate = new Date().getHours() + ":" + minutes;
    }

    if (timestampFormat == "h:mm:ss") {
      this.currentDate += ":" + new Date().getSeconds() + " ";
    } else if (timestampFormat == "h:mm") {
      this.currentDate += " ";
    }

  }

  ngOnInit() {
    this.init();
  }


  async onUserCard() {
    const token = await this.settings.getToken();
    this.settings.getUserCardInfo(this.currentName.trim(), token).subscribe((response: any) => {
      response.data[0]["last_message"] = this.currentMessage;
      response.data[0]["current_date"] = this.currentDate;
      response.data[0]["user_color"] = this.userColor;
      console.log(response.data[0]);
      localStorage.setItem("next-user-card", JSON.stringify(response.data[0]));
      this.settings.openUserCard();
    });


  }




  initGlobalEmotes() {
    for (const emoji of this.emojis) {
      this.emojiSet.add(emoji.name);
    }
    for (const emoji of this.emojisChannel) {
      this.emojiSet.add(emoji.name);
    }

    for (let i = 0; i < this.emojisChannel.length; i++) {
      this.emojis.push({ name: this.emojisChannel[i]["name"], url: this.emojisChannel[i]["images"]["url_1x"], url_2: this.emojisChannel[i]["images"]["url_2x"] })
    }

  }

  checkMessage() {
    this.initGlobalEmotes();

    let foundEmotesImages: { url: '' }[] = [];

    const messageParts = this.message.split(': ');
    const userMessage = messageParts.length > 1 ? messageParts[1] : this.message;

    const words = userMessage.split(/\s+/);
    this.foundEmotes = words.filter(word => this.emojiSet.has(word));

    if (this.foundEmotes) {
      this.processedMessageEmoji = words.map(word => {
        this.emojiIndex = this.emojis.findIndex(emoji => emoji.name === word);
        if (this.emojiIndex !== -1) {
          return `<img src="${this.emojis[this.emojiIndex].url}">`;
        }
        return word;
      });

      this.emoteMessage = this.processedMessageEmoji;
      for (let i = 0; i < this.emoteMessage.length; i++) {
        if (this.emoteMessage[i].includes("<img")) {
          this.emoteHTML.push(this.emoteMessage[i]);
        }
      }

    }

  }

  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


  OnMouseEnterGlobal(item: any, index: number) {
    this.showGlobalEmojiDesc = true;
    this.hoverEmoji = item;
    this.currentHoverEmoteName = this.foundEmotes[index];
    if (this.currentHoverEmoteName == undefined) {
      this.currentHoverEmoteName = this.foundEmotes[this.foundEmotes.length - 1];
    }

    const urlMatch = item.match(/src="([^"]+)"/);
    let imageUrl = urlMatch ? urlMatch[1] : '';
    let a = imageUrl.split("/");
    a[a.length - 1] = "2.0";
    imageUrl = a.join("/");

    this.currentHoverEmote = {
      title: this.currentHoverEmoteName,
      img: this.sanitizer.bypassSecurityTrustUrl(imageUrl)
    }
  }

  OnMouseLeaveGlobal() {
    this.showGlobalEmojiDesc = false;
  }

  onBadgeHover(img: string, title: string) {
    this.currentHoverBadge = {
      img: this.sanitizer.bypassSecurityTrustUrl(img),
      title: title
    }
    this.showBadge = true;

  }

  onBadgeLeave() {
    this.showBadge = false;
  }

  updateHoverPosition(event: MouseEvent, type: 'badge' | 'emoji', posX: number, posY: number) {
    const offsetY = 0;
    const offsetX = 20;

    posX = event.clientX + offsetX;
    posY = event.clientY + offsetY;

    if (posY >= 600) {
      posY -= 100;
    }

    if (type == 'badge') {
      this.hoverBadgeX = posX;
      this.hoverBadgeY = posY;
    } else {
      this.hoverEmojiGlobalX = posX;
      this.hoverEmojiGlobalY = posY;
    }

  }





}
