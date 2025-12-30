import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  ChangeDetectorRef
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
import { CommonModule } from '@angular/common';
import { ToastComponent } from '../toast/toast.component';

// TODO: better tv emotes
// TODO: Tabsystem
// TODO: emoji picker
// TODO: channel points
// TODO: work on perfomance
// TODO: mark streamer as favourite
// TODO: channels you follow option => dont make seperate window
// TODO: show for how long the stream is going for if possible



@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    ToastComponent,
    RouterOutlet,
    ChatComponent,
    TopbarComponent,
    MatDialogModule,
    DialogBoxComponent,
    CommonModule,
    FormsModule,
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
  currentChannel: string = "";
  userChatMessage = "";
  placeholderString: string = "";
  private currChannelSub?: Subscription;
  streamerData: any;
  chatterInfo: { color: string, badges: string[], badgeImages: { img: string, title: string }[] } = { color: "", badges: [], badgeImages: [{ img: "", title: "" }] };
  isConnected: boolean = true;

  showToast: boolean = false;
  currentToastData: { message: string, duration: string }[] = [{ message: "", duration: "" }];

  chatSettings: any;

  channelBadgeInfo: { bits: any, subscriber: any, global: any } = {
    bits: "",
    subscriber: "",
    global: ""
  }

  streamInfoToShow: { title: string, thumbnail: string, game_name: string, viewer_count: string } = {
    title: "",
    thumbnail: "",
    game_name: "",
    viewer_count: ""
  };

  globalEmojiNames: { name: string; url: string, url_2: string }[] = [];
  channelEmojis: any;
  showVerticalMenuOptions: boolean = false;
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

  onOpenFollowerList() {
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "500px",
      panelClass: "container",

      data: {
        height: "500px",
        width: "400px",
        function: "open_follower_list",
      },
    });
  }

  onEmojiPicker() {
    this.settings.openEmojiPicker();
  }


  private handleStorageChange = (event: StorageEvent) => {
    if (event.key == "emoji") {
      this.userChatMessage += event.newValue || '';
    }
  };

  loadChannelEmojisForChat() {
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat.getChannelEmotes(id).subscribe((response: any) => {
      this.channelEmojis = response.data;
    });

  }

  loadEmojisForChat() {
    this.chat.getGlobalEmotes().subscribe((response: any) => {
      for (let i = 0; i < response.data.length; i++) {
        this.globalEmojiNames.push({ name: response.data[i]["name"], url: response.data[i]["images"]["url_1x"], url_2: response.data[i]["images"]["url_2x"] });
      }
    });

  }

  async initBadges() {
    await this.getGlobalBadges();
    await this.getBadgesForChannel();
  }

  initChatSettings() {
    this.currentToastData.length = 0;
    const token: any = localStorage.getItem("twitch_token");
    this.settings.getBroadCasterId(token, this.currentChannel).subscribe((id: string) => {
      this.settings.getChatSettings(id).subscribe((response: any) => {
        this.chatSettings = response.data[0];
        if (this.chatSettings.emote_mode) {
          this.currentToastData.push({ message: "Emote only mode is on!", duration: "2700" });
          this.showToast = true;
        }
        if (this.chatSettings.follower_mode) {
          this.currentToastData.push({ message: "Follower mode is on! (" + Math.round(this.chatSettings.follower_mode_duration / 60) + "h)", duration: "2500" });
          this.showToast = true;
        }
        if (this.chatSettings.slow_mode) {
          this.currentToastData.push({ message: "Slow mode is on!", duration: "2400" });
          this.showToast = true;
        }
        if (this.chatSettings.subscriber_mode) {
          this.currentToastData.push({ message: "Subscriber mode is on!", duration: "2800" });
          this.showToast = true;
        }
      });
    });
  }

  onHideSingleToast(index: number) {
    this.currentToastData.splice(index, 1);
  }

  onHideToast() {
    this.currentToastData.length = 0;
  }

  ngOnInit() {
    this.checkIfLoggedIn();
  }

  setCurrentChannel() {
    const username: any = localStorage.getItem("username");
    localStorage.setItem("channel", username);
    this.currentChannel = username;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
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

  onOpenModView() {
    const url = "https://www.twitch.tv/moderator/" + this.currentChannel;
    this.settings.openExternalLink(url);
  }

  onVerticalMenu() {
    this.showVerticalMenuOptions = !this.showVerticalMenuOptions;
  }

  onDisableVerticalMenu() {
    this.showVerticalMenuOptions = false;
  }

  saveCurrentBroadCasterId() {
    const token: any = localStorage.getItem("twitch_token");
    this.settings.getBroadCasterId(token, this.currentChannel).subscribe(id => {
      localStorage.setItem("broadcaster_id", id);
      this.loadChannelEmojisForChat();
    });
  }

  onSwitchChannel(name: string) {
    localStorage.setItem("channel", name);
    this.fetchStreamInfos(name);
    this.messages.length = 0;
    this.currentChannel = name;
    this.saveCurrentBroadCasterId();
    this.chat.disconnect();
    this.loadChatMessages(this.currentChannel);
    this.getBadgesForChannel();
    this.initChatSettings();

  }

  onClearChat() {
    this.messages.length = 0;
  }

  onChooseChannel() {
    if (!this.loginStatus) { return; }
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "220px",
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
    if (!channel) { return; }
    const token: any = localStorage.getItem("twitch_token");
    this.chat.getStreamInfo(channel, token).subscribe((result: any) => {
      if (result.data.length > 0) {
        this.streamerData = result.data[0];

        let viewers = this.streamerData.viewer_count;
        let viewers_split = viewers.toString().split("");
        let final_viewer_count_string = "";

        if (viewers >= 1000 && viewers < 10000) {
          final_viewer_count_string = viewers_split[0] + "." + viewers_split[1] + viewers_split[2] + viewers_split[3];
        } else if (viewers >= 10000 && viewers < 100000) {
          final_viewer_count_string = viewers_split[0] + viewers_split[1] + "." + viewers_split[2] + viewers_split[3] + viewers_split[4];
        } else {
          final_viewer_count_string = this.streamerData.viewer_count;
        }

        this.streamInfoToShow = {
          title: this.streamerData.title,
          thumbnail: "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + this.currentChannel.replace(/\\s/g, '') + "-300x200.jpg",
          game_name: this.streamerData.game_name,
          viewer_count: final_viewer_count_string,
        }

      } else {
        this.streamInfoToShow = {
          title: this.currentChannel + " is offline :/",
          game_name: "",
          thumbnail: "",
          viewer_count: "",
        }

      }
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
    } else if (event.key !== "Enter") {
      return;
    }

    const token: any = localStorage.getItem("twitch_token");
    this.accessToken = token;

    if (event.key === "Enter" && this.userChatMessage != "") {
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
            //console.log("got sender id");
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
              this.currentToastData.push({ message: result.data[0].drop_reason.message, duration: "5000" });
              this.showToast = true;
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

  onDisconnect() {
    this.isConnected = false;
    this.chat.disconnect();
  }

  loadChatMessages(channel: string) {
    this.isConnected = true;
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
            this.sub = this.chat.messages$.subscribe((msg) => {
              this.messages.push(msg)
              if (this.messages.length >= 1000) {
                this.messages.splice(0, 1000);
              }
            });


            this.chat.getChatterBadge().subscribe(badges => {
              this.chatterInfo.badges = badges;
              this.getImageForBadge();
            });

            this.chat.getChatterColor().subscribe(color => {
              this.chatterInfo.color = color;
            });

          }
        }
      });
  }

  getImageForBadge() {
    let a = this.chat.getImageFromBadgeName(this.chatterInfo.badges, this.channelBadgeInfo)
    this.chatterInfo.badgeImages = a;

    //console.log("badge images found:");
    //for (const img of a) {
    //  console.log(img);
    //}


  }

  async getBadgesForChannel() {
    const token: any = localStorage.getItem("twitch_token");
    const channel: any = localStorage.getItem("channel");

    let subscriberBadges: string[];
    let bitsBadges: string[];
    this.settings.getBroadCasterId(token, channel).subscribe(response => {
      const broadcaster_id = response;
      this.chat.getChannelBadges(broadcaster_id).subscribe((response: any) => {
        // check set_id and then set 
        if (response.data.length > 0) {
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i]["set_id"] == "subscriber") {
              subscriberBadges = response.data[i]["versions"];
            } else if (response.data[i]["set_id"] == "bits") {
              bitsBadges = response.data[i]["versions"];
            }
          }
        }
        const global_badges: any = localStorage.getItem("global_badges");
        let global_badges_json = JSON.parse(global_badges);
        this.channelBadgeInfo = {
          subscriber: subscriberBadges,
          bits: bitsBadges,
          global: global_badges_json
        }

      });
    });
  }

  async getGlobalBadges() {
    this.chat.getGlobalChatBadges().subscribe((response: any) => {
      localStorage.setItem("global_badges", JSON.stringify(response.data));
    });
  }

  checkIfLoggedIn() {
    const username = localStorage.getItem("username");
    this.settings.getLoginStatus().subscribe(response => {
      const token: any = localStorage.getItem("twitch_token");
      console.log("login: " + response);
      if (!this.loginStatus) {
        this.currentChannel = "Unknown";
        this.placeholderString = "Login to send a message";
        this.currentToastData.push({ message: "Please login!", duration: "5000" });
        this.showToast = true;
      } else {
        this.placeholderString = "Send a message as " + username;
        this.initializeLoggedInFeatures();
      }
    });
  }

  initializeLoggedInFeatures() {
    this.setCurrentChannel();
    this.loadChannelEmojisForChat();
    this.loadEmojisForChat();
    this.saveCurrentBroadCasterId();
    this.initChatSettings();
    this.initBadges();
    const emoji: any = localStorage.getItem("emoji") || '';
    window.addEventListener('storage', this.handleStorageChange);

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
          this.setAccountData(
            data[0]["description"],
            data[0]["profile_image_url"],
            data[0]["created_at"],
            data[0]["view_count"],
          );
          this.settings
            .checkAccessTokenValidity(this.accessToken)
            .subscribe((result) => {
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
    if (this.currChannelSub) {
      this.currChannelSub.unsubscribe();
    }
    window.removeEventListener('storage', this.handleStorageChange);
  }
}
