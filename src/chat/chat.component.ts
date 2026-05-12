import { Component, Input, OnInit, ViewChild, ElementRef, EventEmitter,Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SettingsService } from "../services/settings.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ComponentFactoryResolver, Injector } from "@angular/core";
import { UserCardComponent } from "../user-card/user-card.component";
import { TwitchChatService } from "../services/twitchChat.service";
import { DomSanitizer, SafeUrl, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "app-chat",
  imports: [CommonModule, FormsModule, RouterModule, UserCardComponent],
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.css",
})
export class ChatComponent implements OnInit {
  @Input() message: string = "";
  @Input() color: string = "white";
  @Input() badges: any;
  @Input() emojis: { name: string; url: string; url_2: string,format: string[] | string }[] = [];
  @Input() emojisChannel: any[] = [];
  @Input() betterttvGlobalEmotes: { name: string; url: string; url_2: string,format: string }[] = [];
  @Input() betterttvChannelEmotes: { name: string; url: string; url_2: string,format: string }[] = [];
  @Input() reply: any;
  @Input() id: string = "";
  @Input() seventvChannelEmotes: { name: string,url: string,url_2: string,format: string}[] = [];
  @Input() seventvGlobalEmotes: { name: string,url: string,url_2: string,format: string}[] = [];
  @Output() onReply = new EventEmitter<{name: string,message: string,id: string,color: string}>;
  @ViewChild("container") containerDiv!: ElementRef;

  public title = "Lurker";
  public currentDate: string = "";
  public currentName: string = "";
  public currentMessage: string = "";
  public currentBadges: any;
  public emojiSet: Set<string> = new Set();
  public foundEmotes: any;
  public emojiIndex: number = 0;
  public emoteMessage: string[] = [];
  public userColor: string = "white";
  public emoteHTML: string[] = [];
  public currentEmoteHoverIndex: number = 0;
  public currentHoverEmoteName = "";

  public showGlobalEmojiDesc: boolean = false;
  public hoverEmojiGlobalX = 0;
  public hoverEmojiGlobalY = 0;
  public processedMessageEmoji: string[] = [];
  public hoverEmoji: string = "";
  public userToListenTo: string = "";
  public isHoveringMessage: boolean = false;

  public showBadge: boolean = false;
  public hoverBadgeX = 0;
  public hoverBadgeY = 0;
  public currentHoverBadge: { title: string; img: SafeUrl } = { title: "", img: "" };
  public currentHoverEmote: { title: string; img: SafeUrl } = { title: "", img: "" };

  isReply: boolean = false;
  isMention: boolean = false;

  isOwnMessage: boolean = false;

  messageReplyData: any;

  constructor(
    public settings: SettingsService,
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

  async init() {
    this.checkMessage();
    const splitMessage = this.message.split(":");
    this.checkIfMentions(splitMessage[1]);
    this.currentName = splitMessage[0];
    this.currentMessage = splitMessage[1];
    this.currentBadges = {
      images: this.badges.badgeImages,
      title: this.badges.badges,
    };

    const username = await this.settings.getStoredUsername();
    if (this.currentName == username) {
      this.isOwnMessage = true;
    }

    if (this.reply) {
      this.isReply = true;
      this.reply.msg = this.reply.msg.replace(/\\s/g, " ");
    }


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
    this.initEmotes();
    this.init();
  }

  onMessageHover() {
    this.isHoveringMessage = true;
  }

  onReplyToMessage() {
    this.onReply.emit({name: this.currentName,message: this.message,id: this.id,color: this.color});
  }

  onLeaveMessageHover() {
    this.isHoveringMessage = false;
  }

  async onUserCard() {
    const token = await this.settings.getToken();
    this.settings
      .getUserCardInfo(this.currentName.trim(), token)
      .subscribe((response: any) => {
        response.data[0]["last_message"] = this.currentMessage;
        response.data[0]["current_date"] = this.currentDate;
        response.data[0]["user_color"] = this.userColor;
        localStorage.setItem(
          "next-user-card",
          JSON.stringify(response.data[0]),
        );
        this.settings.openUserCard();
      });
  }

  initEmotes() {
    for (const emoji of this.emojis) {
      this.emojiSet.add(emoji.name);
    }
    for (const emoji of this.emojisChannel) {
      this.emojiSet.add(emoji.name);
    }

    for (const emoji of this.betterttvGlobalEmotes) {
      this.emojiSet.add(emoji.name);
    }

    for (const emoji of this.betterttvChannelEmotes) {
      this.emojiSet.add(emoji.name);
    }

    for (const emoji of this.seventvChannelEmotes) {
      this.emojiSet.add(emoji.name);
    }

    for (const emoji of this.seventvGlobalEmotes) {
      this.emojiSet.add(emoji.name);
    }

    this.emojis = this.emojis.concat(this.emojisChannel,this.betterttvGlobalEmotes,this.betterttvChannelEmotes,this.seventvChannelEmotes,this.seventvGlobalEmotes);
  }

  checkMessage() {
    const parts = this.message.split(/(\s+)/);
    this.foundEmotes = parts.filter((word: any) => this.emojiSet.has(word));

    if (this.foundEmotes) {
      this.processedMessageEmoji = parts.map((word) => {
        this.emojiIndex = this.emojis.findIndex((emoji) => emoji.name === word);
        if (this.emojiIndex !== -1) {
          let formatInEmojiUrl = this.emojis[this.emojiIndex].url.split("/");
          let formatInEmojiUrl_2 = this.emojis[this.emojiIndex].url_2.split("/");
          let emojiUrl = "";
          let emojiUrl_2 = "";

          const emojiFormat = this.emojis[this.emojiIndex].format;

          if (emojiFormat != "betterttv" && emojiFormat != "7tv") {
            if (emojiFormat.includes('animated')) {
              formatInEmojiUrl[6] = 'animated';
              formatInEmojiUrl_2[6] = 'animated';
              emojiUrl = formatInEmojiUrl.join("/");
              emojiUrl_2 = formatInEmojiUrl_2.join("/");
              this.emojis[this.emojiIndex].url = emojiUrl;
              this.emojis[this.emojiIndex].url_2 = emojiUrl_2;
            } else {
              formatInEmojiUrl_2[6] = 'static';
              formatInEmojiUrl[6] = 'static';
              emojiUrl = formatInEmojiUrl.join("/");
              emojiUrl_2 = formatInEmojiUrl_2.join("/");
              this.emojis[this.emojiIndex].url = emojiUrl;
              this.emojis[this.emojiIndex].url_2 = emojiUrl_2;
            }
          } else {
              emojiUrl = this.emojis[this.emojiIndex].url;
          }

          return `<img src="${emojiUrl}">`;
        }
        return word;
      });

      this.emoteMessage = this.processedMessageEmoji;
      this.emoteMessage.shift();
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

  onHoverEmote(item: any, index: number) {
    this.showGlobalEmojiDesc = true;
    this.hoverEmoji = item;
    const regex = /<img\s+src="([^"]+)"/;
    const match = item.match(regex)[1];
    let emojiItem = this.emojis.find( (x: any) => x.url == match);


    this.currentHoverEmote = {
      title: emojiItem!.name,
      img: this.sanitizer.bypassSecurityTrustUrl(emojiItem!.url_2),
    };
  }

  OnMouseLeaveGlobal() {
    this.showGlobalEmojiDesc = false;
  }

  onBadgeHover(img: string, title: string) {
    this.currentHoverBadge = {
      img: this.sanitizer.bypassSecurityTrustUrl(img),
      title: title,
    };
    this.showBadge = true;
  }

  onBadgeLeave() {
    this.showBadge = false;
  }

  updateHoverPosition(
    event: MouseEvent,
    type: "badge" | "emoji",
    posX: number,
    posY: number,
  ) {
    const offsetY = 0;
    const offsetX = 20;

    posX = event.clientX + offsetX;
    posY = event.clientY + offsetY;

    if (posY >= 500) {
      posY -= 100;
    }

    if (type == "badge") {
      this.hoverBadgeX = posX;
      this.hoverBadgeY = posY;
    } else {
      this.hoverEmojiGlobalX = posX;
      this.hoverEmojiGlobalY = posY;
    }
  }
}
