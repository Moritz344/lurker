import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-root',
	standalone: true,
  imports: [RouterOutlet,ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'chatter';
	username: string = "";
	accessToken: any ;
	sub?: Subscription;
	messages: string[] = [];

	constructor(private route: ActivatedRoute,private settings: SettingsService,
						 private chat: TwitchChatService) {}

	loadUserToken() {
					this.route.fragment.subscribe(fragment => {
									if (fragment) {
													const params = new URLSearchParams(fragment);
													this.accessToken = params.get('access_token');
													this.settings.setAccessToken(this.accessToken);
									}
					});

					this.settings.getUserInfo().subscribe(data => {
									this.settings.setUserName(data);
					});

	}

	loadChatMessages() {
					 this.settings.getUserName().pipe(
				   switchMap(username =>
								   this.settings.getAccessToken().pipe(
								   map(token => ({ token, username }))
				        )
           )
					 ).subscribe(({ token, username }) => {
								const channel = "Autophil";
    		   			this.chat.connect(token, username, channel);
								if (!this.sub || this.sub.closed) {
												this.sub = this.chat.messages$.subscribe(msg => this.messages.push(msg));
								}
				   });

	}

	ngOnInit() {
					this.loadUserToken();
					this.loadChatMessages();
	}
}
