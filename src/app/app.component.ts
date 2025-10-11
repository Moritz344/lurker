import { Component, OnInit,ViewChild,ElementRef,HostListener } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { ChatComponent } from '../chat/chat.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { FormsModule } from '@angular/forms';

// TODO: chat colors
// TODO: better tv emotes
// TODO: Tabsystem

@Component({
  selector: 'app-root',
	standalone: true,
  imports: [RouterOutlet,ChatComponent,TopbarComponent,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  @ViewChild('chat') chatBox!: ElementRef;

  title = 'chatter';
	username: string = "";
	accessToken: any ;
	sub?: Subscription;
	messages: string[] = [];
	scrollAuto: boolean = true;
	scrollInterval = 100;
	userScrolling: boolean = false;
	currentChannel: string = "papaplatte";

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

	scrollChatbox() {
								setInterval(() => {
												if (this.scrollAuto) {
												const element = this.chatBox.nativeElement;
      	  							element.scrollTop += 10;
					}
								}, 10);
	}

	onSwitchChannel() {
					console.log(this.currentChannel);
					this.chat.disconnect();
					this.loadChatMessages(this.currentChannel);
	}

	scrollStop() {
					this.scrollAuto = false;
	}

	@HostListener("wheel",['$event'])
	onScroll(event: WheelEvent) {
				this.scrollAuto = false;
				this.userScrolling = true;

				console.log("scroll height",event.pageY);
				if (event.pageY >= 400) {
								this.scrollAuto = true;
				}
	}

  @HostListener('mouseup', ['$event'])
	onMouseUp(event: MouseEvent) {
					this.userScrolling = false;
					this.scrollAuto = true;
	}

	loadChatMessages(channel: string) {
					 this.settings.getUserName().pipe(
				   switchMap(username =>
								   this.settings.getAccessToken().pipe(
								   map(token => ({ token, username }))
				        )
           )
					 ).subscribe(({ token, username }) => {
    		   			this.chat.connect(token, username, channel);
								if (!this.sub || this.sub.closed) {
												this.sub = this.chat.messages$.subscribe(msg => this.messages.push(msg));
								}
				   });

	}

	ngOnInit() {
					this.scrollChatbox();
					this.loadUserToken();
					this.loadChatMessages(this.currentChannel);
	}

}
