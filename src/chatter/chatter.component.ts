import { Component } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService} from '../services/twitchChat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// TODO: man sieht gerade nur die letzte nachricht

@Component({
  selector: 'app-chatter',
  imports: [CommonModule,FormsModule],
  templateUrl: './chatter.component.html',
  styleUrl: './chatter.component.css'
})
export class ChatterComponent {

			data: any;
			searchValue: string = "";

			constructor(public settings: SettingsService,
						public chat: TwitchChatService) {
						const user_id: any = localStorage.getItem("user_id");

						this.chat.getChatters(user_id,user_id).subscribe((response: any) => {
									this.data = response.data;
						});
			}

			search() {}

}
