import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";
import { switchMap, map } from "rxjs/operators";
import { ChatComponent } from "../chat/chat.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { DialogBoxComponent } from "../dialog-box/dialog-box.component";
import { SettingsComponent } from "../settings/settings.component";
import { CommonModule } from '@angular/common';

// TODO: better tv emotes
// TODO: Tabsystem
// TODO: emoji picker
// TODO: Twitch emotes: https://dev.twitch.tv/docs/chat/send-receive-messages/
// TODO: channel points
// TODO: stream information
// TODO: option to show streamers that user follows
// TODO: user card

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    ChatComponent,
    TopbarComponent,
    MatDialogModule,
    DialogBoxComponent,
				CommonModule,
				FormsModule
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild("chat") chatBox!: ElementRef;
  @ViewChild("chatEntry") entry!: ElementRef;

  title = "Lurker";
  username: string = "";
  accessToken: any;
  sub?: Subscription;
  messages: string[] = [];
  scrollAuto: boolean = false;
  scrollInterval = 100;
  userScrolling: boolean = false;
  currentChannel: string = "NORMAN";
  userChatMessage: string = "";
  placeholderString: string = "";
  private loginSub?: Subscription;
  private getLoginSub?: Subscription;
  private currChannelSub?: Subscription;
		streamerData: any;

  showVerticalMenuOptions: boolean = false;
  streamTitel: string = "";
  channelNameHover: boolean = false;

  loginStatus: boolean = true;

  applyUserSettings() {
    const settings: any = localStorage.getItem("settings");
    const settingsJson = JSON.parse(settings);
    if (settingsJson) {
      document.documentElement.style.setProperty(
        "--default-font",
        settingsJson[0].font,
      );
    }
  }

		checkIfModerator() {
		}

  ngOnInit() {
    this.checkIfModerator();
    this.applyUserSettings();
    const user: any = localStorage.getItem("username");
				this.username = user;
    this.loadChatMessages(this.currentChannel);
    this.settings.getUserId().subscribe((id) => {
      this.settings.setUserId(id);
    });
    this.scrollChatbox();

    this.currChannelSub = this.settings
      .getCurrentChannel()
      .subscribe((result: any) => {
        if (result) {
          this.currentChannel = result;
          this.onSwitchChannel(this.currentChannel);
        }
      });
    this.fetchStreamInfos(this.currentChannel);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private dialog: MatDialog,
  ) {
    this.checkIfLoggedIn();
  }

  scrollChatbox() {
    setInterval(() => {
      if (this.scrollAuto) {
        const element = this.chatBox.nativeElement;
        if (element.scrollTop > 0) {
          element.scrollTop += 10;
        }
      }
    }, 10);
  }

		onChatterList() {
										this.settings.openChatterList();
		}

  onChannelNameHover() {
    this.channelNameHover = true;
  }
  onChannelNameLeave() {
    this.channelNameHover = false;
  }

  onOpenStreamInBrowser() {
    const url = "https://twitch.tv/" + this.currentChannel;
    this.settings.openExternalLink(url);
  }

  onVerticalMenu() {
    this.showVerticalMenuOptions = !this.showVerticalMenuOptions;
  }

  onDisableVerticalMenu() {
    this.showVerticalMenuOptions = false;
  }

  onSwitchChannel(name: string) {
    this.fetchStreamInfos(name);
    this.messages.length = 0;
    this.currentChannel = name;
    this.chat.disconnect();
    this.loadChatMessages(this.currentChannel);
  }

  onClearChat() {
    this.messages.length = 0;
  }

  onChooseChannel() {
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "320px",
      panelClass: "container",

      data: {
        message: "Type in a channel name",
        function: "change_channel_name",
      },
    });
  }

  onCreatePoll() {
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "300px",
      panelClass: "container",

      data: {
        message: "Create a Poll",
        function: "create_poll",
      },
    });
  }

  fetchStreamInfos(channel: string) {
    const token: any = localStorage.getItem("twitch_token");
    this.chat.getStreamInfo(channel, token).subscribe((result: any) => {
						this.streamerData = result.data[0];
      console.log(channel, token, result);
      if (result.data.length >= 1) {
        this.streamTitel = result.data[0]["title"];
      } else {
        this.streamTitel = "";
      }
      console.log(this.streamTitel);
    });
  }

  onAnnouncement() {
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "200px",
      panelClass: "container",
      data: {
        message: "What should be the announcement?",
        function: "announcement",
      },
    });
  }

  onSendMessage(event: KeyboardEvent) {
    if (event.key === "Enter" && event.shiftKey) {
      this.userChatMessage += "\n";
      return;
    }

    const token: any = localStorage.getItem("twitch_token");
    this.accessToken = token;

    if (event.key === "Enter") {
      event.preventDefault();
      this.settings
        .checkAccessTokenValidity(this.accessToken)
        .subscribe((result) => {
          console.log("token is valid?", result, this.accessToken);
          if (!result) {
            alert("Your token is not valid. Please login again.");
            this.logout();
            return;
          }
        });
      // TODO: handle drop reasons: like followers only mode
      this.settings
        .getUserId()
        .pipe(
          switchMap((userIdResult: any) => {
            const senderId = userIdResult;
            console.log("got sender id");
            return this.settings
              .getBroadCasterId(this.accessToken, this.currentChannel)
              .pipe(
                switchMap((broadcasterIdResult: any) => {
                  const broadcasterId = broadcasterIdResult;
                  console.log("got broadcaster id");
                  return this.chat.sendMessage(
                    this.currentChannel,
                    senderId,
                    broadcasterId,
                    this.userChatMessage,
                    this.accessToken,
                  );
                }),
              );
          }),
        )
        .subscribe(
          (result: any) => {
            if (result.data[0].drop_reason) {
              alert(result.data[0].drop_reason.message);
              return;
            }
            this.userChatMessage = "";
          },
          (error) => {
            console.error("Error sending message:", error);
          }
        );
    }
  }

  scrollToBottom() {
    if (this.scrollAuto) {
      const chat = this.chatBox.nativeElement;
      chat.scrollTop = chat.scrollHeight;
    }
  }

  @HostListener("wheel", ["$event"])
  onScroll(event: WheelEvent) {
    const chat = this.chatBox.nativeElement;

    const atBottom =
      chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 1;

    if (event.deltaY < 0) {
      this.scrollAuto = false;
    } else if (atBottom) {
      this.scrollAuto = true;
    }
  }

  @HostListener("mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    this.userScrolling = false;
    this.scrollAuto = true;
  }

  loadChatMessages(channel: string) {
    this.scrollToBottom();
    this.settings
      .getUserName()
      .pipe(
        switchMap((username) =>
          this.settings
            .getAccessToken()
            .pipe(map((token) => ({ token, username }))),
        ),
      )
      .subscribe(({ token, username }) => {
        if (token && username) {
          this.chat.connect(token, username, channel);
          if (!this.sub || this.sub.closed) {
            this.sub = this.chat.messages$.subscribe((msg) =>
              this.messages.push(msg),
            );
          }
        }
      });
  }

  checkIfLoggedIn() {
    const token: any = localStorage.getItem("twitch_token");
    const username: any = localStorage.getItem("username");
    if (!token) {
      this.settings.setLoginStatus(false);
      this.placeholderString = "Login to send a message";
    } else {
      this.settings.setLoginStatus(true);
      this.placeholderString = "Send a message as " + username;
    }
  }

  logout() {
    this.chat.UserRelog();
    this.loadUserToken();
    this.settings.setLoginStatus(false);
  }

  setAccountData(
    desc: string,
    image_url: string,
    created_at: string,
    view_count: number,
  ): void {
    localStorage.setItem("description", desc);
    localStorage.setItem("profile_image_url", image_url);
    localStorage.setItem("created_at", created_at);
    localStorage.setItem("view_count", view_count.toString());
  }

  loadUserToken() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get("access_token");
        this.settings.setAccessToken(this.accessToken);
        this.settings.getUserInfo().subscribe((data: any) => {
          this.settings.setUserName(data[0]["display_name"]);
          console.log(data);
          this.setAccountData(
            data[0]["description"],
            data[0]["profile_image_url"],
            data[0]["created_at"],
            data[0]["view_count"],
          );
          this.settings
            .checkAccessTokenValidity(this.accessToken)
            .subscribe((result) => {
              //console.log("token is valid?",result,this.accessToken);
              if (!result) {
                alert("Your token is not valid. Try logging in again.");
                this.logout();
              }
            });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.loginSub) {
      this.loginSub.unsubscribe();
    } else if (this.getLoginSub) {
      this.getLoginSub.unsubscribe();
    } else if (this.currChannelSub) {
      this.currChannelSub.unsubscribe();
    }
  }
}
