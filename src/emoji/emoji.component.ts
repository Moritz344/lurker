import { Component,OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService} from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-emoji',
  imports: [CommonModule,FormsModule],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.css'
})
export class EmojiComponent implements OnInit{

      currentTab: string = "global";
      globalEmotes: any;
      searchValue: string = "";

			constructor(public chat: TwitchChatService) {}
    
      ngOnInit() {
        this.chat.getGlobalEmotes().subscribe((response: any) => {
            this.globalEmotes = response.data;
        });
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

}
