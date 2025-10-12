import { Component, OnInit,ViewChild,ElementRef,HostListener,OnChanges } from '@angular/core';
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
  imports: [RouterOutlet,ChatComponent,TopbarComponent,FormsModule,],
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
	scrollAuto: boolean = false;
	scrollInterval = 100;
	userScrolling: boolean = false;
	currentChannel: string = "CDawg";
	userChatMessage: string = "";
	y = 0;

	constructor(private route: ActivatedRoute,private settings: SettingsService,
						 private chat: TwitchChatService,) {}

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

	onSwitchChannel(name: string) {
					this.currentChannel = name;
					this.chat.disconnect();
					this.loadChatMessages(this.currentChannel);
	}

	onSendMessage() {
    this.settings.getUserId(this.accessToken).pipe(
        switchMap((userIdResult: any) => {
            const senderId = userIdResult.data[0].id;
            return this.settings.getBroadCasterId(this.accessToken, this.currentChannel).pipe(
                switchMap((broadcasterIdResult: any) => {
                    const broadcasterId = broadcasterIdResult.data[0].id;
                    return this.chat.sendMessage(this.currentChannel, senderId, broadcasterId, this.userChatMessage, this.accessToken);
                })
            );
        })
    ).subscribe(result => {
				this.userChatMessage = "";
    }, error => {
        console.error('Error sending message:', error);
    });
}

  scrollToBottom() {
    if (this.scrollAuto) {
      const chat = this.chatBox.nativeElement;
      chat.scrollTop = chat.scrollHeight;
    }
  }

	@HostListener("wheel",['$event'])
	onScroll(event: WheelEvent) {
    const chat = this.chatBox.nativeElement;

		const atBottom = chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 1;


		if (event.deltaY < 0) {
						this.scrollAuto = false;
		}else if (atBottom) {
						this.scrollAuto = true;
		}
	}

  @HostListener('mouseup', ['$event'])
	onMouseUp(event: MouseEvent) {
					this.userScrolling = false;
					this.scrollAuto = true;
	}

	loadChatMessages(channel: string) {
				   this.scrollToBottom();
					 this.settings.getUserName().pipe(
				   switchMap(username =>
								   this.settings.getAccessToken().pipe(
								   map(token => ({ token, username }))
				        )
           )
					 ).subscribe(({ token, username }) => {
    		   			this.chat.connect(token, username, channel);
								if (!this.sub || this.sub.closed) {
												this.sub = this.chat.messages$.subscribe(msg => this.messages.push(new Date().getHours() + ":" + new Date().getMinutes()+ " " + msg  ));
								}
				   });

	}

	ngOnInit() {
					this.settings.getCurrentChannel().subscribe(result => {
									this.currentChannel = result;
									this.onSwitchChannel(this.currentChannel);

					});
					this.scrollChatbox();
					this.loadUserToken();
					this.loadChatMessages(this.currentChannel);
	}



}
