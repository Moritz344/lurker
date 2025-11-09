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
      showEmojiDesc: boolean = false;

      hoverEmojiName: string = "";
      hoverEmojiUrl: string = "";
      hoverX: number = 0;
      hoverY: number = 0;

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
    
      OnMouseEnterGlobal(name: string,url: string) {
          this.hoverEmojiName = name;
          this.hoverEmojiUrl = url;
          this.showEmojiDesc = true;

      }

      OnMouseLeaveGlobal() {
        this.showEmojiDesc = false;
      }
      
      updateHoverPositionGlobal(event: MouseEvent) {
        this.hoverX = event.pageX - 100 
        this.hoverY = event.pageY + 20
      }


}
