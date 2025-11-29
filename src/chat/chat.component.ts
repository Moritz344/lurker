import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SettingsService } from "../services/settings.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { RouterModule, } from '@angular/router';
import { FormsModule} from '@angular/forms';
import { ComponentFactoryResolver, Injector } from '@angular/core';
import { UserCardComponent } from '../user-card/user-card.component';
import { TwitchChatService } from '../services/twitchChat.service';

// TODO: show channel emotes

@Component({
  selector: "app-chat",
  imports: [CommonModule,FormsModule,RouterModule,UserCardComponent],
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.css",
})
export class ChatComponent implements OnInit {
  @Input() message: string = "";
  @Input() emojis: {name:string,url:string,url_2: string}[] = [];
  @Input() emojisChannel: any;


	title = "Lurker"
  currentDate: string = "";
  currentName: string = "";
  currentMessage: string = "";
  emojiSet: Set<string> = new Set();
  foundEmotes: any;
  emojiIndex: number = 0;
  emoteMessage: string[] = [];
  userColorArray: string[] = [
    "#FFA500", // Orange
    "#FF4500", // Orangered
    "#FF0000", // Red
    "#FFFF00", // Yellow
    "#00FF00", // Lime
    "#0000FF", // Blue
    "#8A2BE2", // BlueViolet
    "#4B0082", // Indigo
    "#FF69B4", // HotPink
    "#D2691E", // Chocolate
    "#FF8C00", // DarkOrange
    "#ADFF2F", // GreenYellow
    "#20B2AA", // LightSeaGreen
    "#FFD700", // Gold
    "#32CD32", // LimeGreen
    "#7B68EE", // MediumSlateBlue
    "#FF1493", // DeepPink
  ];
  userColor: string = "white";

  showGlobalEmojiDesc: boolean = false;
  hoverEmojiGlobalX = 0;
  hoverEmojiGlobalY = 0;
  processedMessageEmoji: string[] = [];
  hoverEmoji: string = "";

  constructor(public settings: SettingsService,
							public resolver: ComponentFactoryResolver,
							public chat: TwitchChatService,
							public injector: Injector,
							public router: Router,
							) {

  }


  ngOnInit() {

    this.checkMessage();
    const splitMessage = this.message.split(":");
    this.currentName = splitMessage[0];
    this.currentMessage = splitMessage[1];

    let state = this.settings.getUserColorStatus();
    if (state == "disabled") {
      this.userColor = "white";
    } else {
      this.userColor =
        this.userColorArray[
          Math.floor(Math.random() * this.userColorArray.length)
        ];
    }

    let timestampFormat = this.settings.getUserTimestampFormat();
    if (timestampFormat == undefined) {
      timestampFormat = "h:mm";
    }

    let minutes;
    if (Number(new Date().getMinutes()) < 10) {
      minutes = "0" + new Date().getMinutes() ;
    } else {
      minutes = new Date().getMinutes().toString();
    }
    if (timestampFormat !== "disabled") {
      this.currentDate =new Date().getHours() + ":" + minutes;
    }

    if (timestampFormat == "h:mm:ss") {
      this.currentDate += ":" + new Date().getSeconds() + " ";
    } else if (timestampFormat == "h:mm") {
      this.currentDate += " ";
    }
  }

	onUserCard() {
		 this.settings.getUserCardInfo(this.currentName).subscribe((response: any) => {
		 	 response.data[0]["last_message"] = this.currentMessage;
		 	 response.data[0]["current_date"] = this.currentDate;
		 	 response.data[0]["user_color"] = this.userColor;
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

    for (let i=0;i<this.emojisChannel.length;i++) {
      this.emojis.push({name: this.emojisChannel[i]["name"],url: this.emojisChannel[i]["images"]["url_1x"],url_2: this.emojisChannel[i]["images"]["url_2x"]})
    }

  }

  checkMessage() {
    this.initGlobalEmotes();

    let foundEmotesImages: {url: ''}[] = [];

    const messageParts = this.message.split(': ');
    const userMessage = messageParts.length > 1 ? messageParts[1] : this.message;

    const words = userMessage.split(/\s+/);
    this.foundEmotes = words.filter(word => this.emojiSet.has(word));

    if (this.foundEmotes) {
      this.processedMessageEmoji = words.map(word => {
        this.emojiIndex = this.emojis.findIndex(emoji => emoji.name === word);
        if (this.emojiIndex !== -1) {
          //foundEmotesImages.push(`<img src="${this.emojis[this.emojiIndex].url}">`)
          return `<img src="${this.emojis[this.emojiIndex].url}">`;
        }
        return word;
    });

      this.emoteMessage = this.processedMessageEmoji;
      
    }



  }


  OnMouseEnterGlobal(item: any) {
      this.hoverEmoji = item;
      this.showGlobalEmojiDesc = true;
  }

  OnMouseLeaveGlobal() {
    this.showGlobalEmojiDesc = false;
  }
  
  updateHoverPositionGlobal(event: MouseEvent) {
    this.hoverEmojiGlobalX = event.pageX - 10 
    this.hoverEmojiGlobalY = event.pageY + 20
  }



}
