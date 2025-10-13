import { Component, OnInit,ViewChild,ElementRef,HostListener,OnChanges,OnDestroy } from '@angular/core';
import { RouterOutlet, ActivatedRoute,Router } from '@angular/router';
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
// TODO: check if token is valid: https://dev.twitch.tv/docs/authentication/#user-access-tokens

@Component({
  selector: 'app-root',
	standalone: true,
  imports: [RouterOutlet,ChatComponent,TopbarComponent,FormsModule,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit,OnDestroy{
  @ViewChild('chat') chatBox!: ElementRef;

  title = 'chatter';
	username: string = "";
	accessToken: any ;
	sub?: Subscription;
	messages: string[] = [];
	scrollAuto: boolean = false;
	scrollInterval = 100;
	userScrolling: boolean = false;
	currentChannel: string = "pennti";
	userChatMessage: string = "";
	userColor: string = "white";
	placeholderString: string = "";
	private loginSub?: Subscription;
	private getLoginSub?: Subscription;
	private currChannelSub?: Subscription;

	loginStatus: boolean = true;

	constructor(private router: Router, private route: ActivatedRoute,private settings: SettingsService,
						 private chat: TwitchChatService,) {
				    	this.checkIfLoggedIn();

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
					this.messages.length = 0;
					this.currentChannel = name;
					this.chat.disconnect();
					this.loadChatMessages(this.currentChannel);
	}

	onSendMessage() {
		this.settings.checkAccessTokenValidity(this.accessToken).subscribe( result => {
						//console.log("token is valid?",result,this.accessToken);
						if (!result) {
										alert("Your token is not valid.");
										this.logout();
										return;
						}
		})
    // TODO: handle drop reasons: like followers only mode
    this.settings.getUserId(this.accessToken).pipe(
        switchMap((userIdResult: any) => {
            const senderId = userIdResult;
						console.log("got sender id");
            return this.settings.getBroadCasterId(this.accessToken, this.currentChannel).pipe(
                switchMap((broadcasterIdResult: any) => {
                    const broadcasterId = broadcasterIdResult;
								    console.log("got broadcaster id");
                    return this.chat.sendMessage(this.currentChannel, senderId, broadcasterId, this.userChatMessage, this.accessToken);
                })
            );
        })
    ).subscribe((result: any) => {
				if (result.data[0].drop_reason) {
								alert(result.data[0].drop_reason.message);
				}
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
								if (token && username) {
												this.chat.connect(token, username, channel);
												if (!this.sub || this.sub.closed) {
																this.sub = this.chat.messages$.subscribe(msg => this.messages.push( msg  ));
												}
								}

												console.log(token,username);
				   });

	}

	checkIfLoggedIn() {
					this.loginSub = this.settings.getAccessToken().subscribe((result: any) => {
									if (!result) {
													this.settings.setLoginStatus(false);
													this.placeholderString = "Login to send a message";
									}else{
													this.settings.setLoginStatus(true);
													this.placeholderString = "Send a message";
									}
					});
	}

	logout() {
					this.chat.disconnect();
					localStorage.removeItem('username');
					localStorage.removeItem('access_token');
					this.settings.setLoginStatus(false);
	}

  loadUserToken() {
					this.route.fragment.subscribe(fragment => {
									if (fragment) {
													const params = new URLSearchParams(fragment);
													this.accessToken = params.get('access_token');
													this.settings.setAccessToken(this.accessToken);
												  this.settings.getUserInfo().subscribe(data => {
												  this.settings.setUserName(data);
													console.log(data);
												  this.settings.checkAccessTokenValidity(this.accessToken).subscribe( result => {
												  				//console.log("token is valid?",result,this.accessToken);
																	if (!result) {
																					alert("Your token is not valid.");
																					this.logout();
																	}
												  })
													});
									}
					});


	}

	ngOnInit() {
					this.getLoginSub = this.settings.getLoginStatus().subscribe(result => {
								  if (result) {
													this.loginStatus = true;
													this.placeholderString = "Send a message";
												  this.loadUserToken();
												  this.scrollChatbox();
												  this.loadChatMessages(this.currentChannel);
									}else{
													this.loginStatus = false;
													this.placeholderString = "Login to send a message";
									}
									console.log("login:",this.loginStatus);
					});


					this.currChannelSub = this.settings.getCurrentChannel().subscribe(result => {
									if (result) {
												this.currentChannel = result;
												this.onSwitchChannel(this.currentChannel);
												console.log("current channel:",result);
									}

					});

	}

	ngOnDestroy() {
					if (this.loginSub) {
									this.loginSub.unsubscribe();
					}else if (this.getLoginSub) {
									this.getLoginSub.unsubscribe();
					}else if (this.currChannelSub) {
									this.currChannelSub.unsubscribe();
					}

	}



}
