import { Component,OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { TwitchChatService } from '../../services/twitchChat.service';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
				// TODO: Show user desc,pfp,etc
				username: string = "";

				constructor(private settings: SettingsService,private chat: TwitchChatService) {}

				ngOnInit() {
								this.settings.getUserName().subscribe(name => {
												if (name) {
													this.username = name;
												}
								});
				}

				onLogin() {
								  this.settings.setLoginStatus(true);
								  const url = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200&scope=chat:read user:write:chat';
									window.location.href = url;
				}

				onLogout() {
								localStorage.removeItem('twitch_token');
								localStorage.removeItem('username');
								localStorage.removeItem('channel_name');
								this.settings.setLoginStatus(false);
								this.username = "";
								this.chat.disconnect();
				}
}
