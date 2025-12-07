import { Component,Input,OnInit,OnDestroy,OnChanges } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit,OnDestroy{

		title = "";
		infos: any;
    last_message: string = "";


		constructor(public settings: SettingsService,public chat: TwitchChatService) {
								const b: any = localStorage.getItem("next-user-card");
    						const settingsJson = JSON.parse(b);
                this.infos = settingsJson;
                this.startChat();
		}

    
    onUserCard() {
        // https://www.twitch.tv/popout/norman/viewercard/Troid23156
        this.settings.openExternalLink("https://twitch.tv/popout/norman/viewercard/" + this.infos.display_name );
    }

    startChat() {
      const token: any = localStorage.getItem("twitch_token");
      const username: any = this.infos.display_name;
      let channel: any = localStorage.getItem("channel");
      console.log(typeof channel);
      if (!channel) {
        channel = username;
      }
        this.chat.connect(token, username, channel);
          let msgSubject = this.chat.messages$.subscribe((msg) => {
                  if (msg.split(":")[0] == username) {
                      this.infos.last_message = msg.split(":")[1];
                  };
          });
        
      }


    ngOnDestroy() {
      localStorage.removeItem("next-user-card");
    }
    
		ngOnInit() {
		}



}
