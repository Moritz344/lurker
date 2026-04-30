import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { RouterOutlet, ActivatedRoute } from "@angular/router";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { ChatComponent } from "../chat/chat.component";
import { TopbarComponent } from "../topbar/topbar.component";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDialog } from "@angular/material/dialog";
import { DialogBoxComponent } from "../dialog-box/dialog-box.component";
import { CommonModule } from "@angular/common";
import { ToastComponent } from "../toast/toast.component";

// TODO: better tv emotes
// TODO: channel points
// TODO: work on perfomance
// TODO: show for how long the stream is going for if possible
// TODO: show replys
// TODO: update viewer count
// TODO: show custom rewards

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
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("chat") chatBox!: ElementRef;
  @ViewChild("chatter") chatter!: ElementRef;
  @ViewChild("chatEntry") entry!: ElementRef;

  public title = "Lurker";
  public accessToken: any;
  public sub?: Subscription;
  public messages: string[] = [];
  public scrollAuto: boolean = true;
  public scrollInterval = 100;
  public userScrolling: boolean = false;
  public currentChannel: string = "";
  public userChatMessage = "";
  public placeholderString: string = "";
  private currChannelSub?: Subscription;
  private currentTabSub?: Subscription;
  public streamerData: any;
  public chatterInfo: {
    color: string;
    badges: string[];
    badgeImages: { img: string; title: string }[];
  } = { color: "", badges: [], badgeImages: [{ img: "", title: "" }] };
  public isConnected: boolean = true;

  public showUserInChat: boolean = false;
  public selectedChatter: number = 0;
  public chatterData: any;

  showToast: boolean = false;
  currentToastData: { message: string; duration: string }[] = [
    { message: "", duration: "" },
  ];

  chatSettings: any;

  channelBadgeInfo: { bits: any; subscriber: any; global: any } = {
    bits: "",
    subscriber: "",
    global: "",
  };

  streamInfoToShow: {
    title: string;
    thumbnail: string;
    game_name: string;
    viewer_count: string;
  } = {
    title: "",
    thumbnail: "",
    game_name: "",
    viewer_count: "",
  };

  userData: any;

  globalEmojiNames: { name: string; url: string; url_2: string }[] = [];
  channelEmojis: any;
  showVerticalMenuOptions: boolean = false;
  channelNameHover: boolean = false;
  zoomLevel: number = 1;

  loginStatus: boolean = true;

  applyUserSettings() {
    const settings: any = localStorage.getItem("settings");
    const settingsJson = JSON.parse(settings);
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
      this.userChatMessage += event.newValue || "";
    }
  };

  async loadChannelEmojisForChat() {
    const id: any = localStorage.getItem("broadcaster_id");
    this.chat
      .getChannelEmotes(id, this.userData.token)
      .subscribe((response: any) => {
        this.channelEmojis = response.data;
      });
  }

  async loadEmojisForChat() {
    this.chat
      .getGlobalEmotes(this.userData.token)
      .subscribe((response: any) => {
        for (let i = 0; i < response.data.length; i++) {
          this.globalEmojiNames.push({
            name: response.data[i]["name"],
            url: response.data[i]["images"]["url_1x"],
            url_2: response.data[i]["images"]["url_2x"],
          });
        }
      });
  }

  async initBadges() {
    await this.getGlobalBadges();
    await this.getBadgesForChannel();
  }

  async initChatSettings() {
    this.currentToastData.length = 0;
    this.settings
      .getBroadCasterId(this.userData.token, this.currentChannel)
      .subscribe((id: string) => {
        this.settings
          .getChatSettings(id, this.userData.token)
          .subscribe((response: any) => {
            this.chatSettings = response.data[0];
            if (this.chatSettings.emote_mode) {
              this.currentToastData.push({
                message: "Emote only mode is on!",
                duration: "5000",
              });
              this.showToast = true;
            }
            if (this.chatSettings.follower_mode) {
              let follower_mode_duration: string =
                Math.round(
                  this.chatSettings.follower_mode_duration / 60,
                ).toString() + "h";
              if (follower_mode_duration == "0h") {
                follower_mode_duration =
                  this.chatSettings.follower_mode_duration.toString() + "m";
              }
              this.currentToastData.push({
                message: "Follower mode is on! " + follower_mode_duration,
                duration: "5000",
              });
              this.showToast = true;
            }
            if (this.chatSettings.slow_mode) {
              let slow_mode_duration = Math.round(
                this.chatSettings.slow_mode_wait_time / 60,
              );
              let finalString = slow_mode_duration.toString() + "m";
              if (slow_mode_duration < 1) {
                slow_mode_duration =
                  this.chatSettings.slow_mode_wait_time.toString();
                finalString = slow_mode_duration.toString() + "s";
              }
              this.currentToastData.push({
                message: "Slow mode is on! " + finalString,
                duration: "5000",
              });
              this.showToast = true;
            }
            if (this.chatSettings.subscriber_mode) {
              this.currentToastData.push({
                message: "Subscriber mode is on! ",
                duration: "2800",
              });
              this.showToast = true;
            }
          });
      });
  }

  onExit() {
    this.settings.exit();
  }

  onHideSingleToast(index: number) {
    this.currentToastData.splice(index, 1);
  }

  onHideToast() {
    this.currentToastData.length = 0;
  }

  ngOnInit() {
    this.settings.initDiscordRPC();
    this.checkIfLoggedIn();
  }

  ngAfterViewInit() {
    this.focusEntry();
  }

  focusEntry() {
    this.entry.nativeElement.focus();
  }

  async setCurrentChannel() {
    this.userData.username = await this.settings.getStoredUsername();
    this.currentChannel = this.userData.username;
  }

  constructor(
    private route: ActivatedRoute,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private dialog: MatDialog,
  ) {}

  scrollChatbox() {
    setInterval(() => {
      if (this.scrollAuto) {
        const element = this.chatBox.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 10);
  }

  onChatterList() {
    this.settings.openChatterList();
  }

  onChannelNameHover() {
    if (!this.loginStatus) {
      return;
    }
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

  async saveCurrentBroadCasterId() {
    this.settings
      .getBroadCasterId(this.userData.token, this.currentChannel)
      .subscribe((id) => {
        localStorage.setItem("broadcaster_id", id);
        this.loadChannelEmojisForChat();
      });
  }

  onClearChat() {
    this.messages.length = 0;
  }

  onLogout() {
    this.currentChannel = "";
    this.placeholderString = "Login to send a message";
    this.currentToastData.push({
      message: "Please login!",
      duration: "5000",
    });
    this.showToast = true;
    this.loginStatus = false;
  }

  async onShowUserInChat() {
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();
    const channel: any = localStorage.getItem("channel");

    this.settings
      .getBroadCasterId(token, channel)
      .subscribe((broadcaster_id: string) => {
        if (!broadcaster_id) {
          console.error("No broadcaster id!");
          return;
        }
        this.settings
          .getModerators(broadcaster_id, token)
          .subscribe((response: any) => {
            if (!response) {
              console.log("Error getting Moderators for channel:", channel);
              return;
            }

            const data = response.data;
            for (let i = 0; i < data.length; i++) {
              if (user_id == data[i].user_id) {
                this.chat
                  .getChatters(broadcaster_id, user_id, token)
                  .subscribe((response: any) => {
                    this.chatterData = response.data;
                    console.log("get chatters");
                  });
                return;
              }
            }
          });
      });
  }

  async onSendMessage(event: KeyboardEvent) {
    if (event.key == "@" && this.currentChannel == this.userData.username) {
      this.showUserInChat = true;
      this.onShowUserInChat();
      return;
    }

    if (this.showUserInChat) {
      if (event.key == "Backspace") {
        this.showUserInChat = false;
        this.userChatMessage = "";
      }
      if (event.key == "ArrowDown") {
        if (this.selectedChatter < this.chatterData.length - 1) {
          this.selectedChatter += 1;
        }
      } else if (event.key == "ArrowUp") {
        if (this.selectedChatter > 0) {
          this.selectedChatter -= 1;
        }
      }

      if (event.key == "Enter") {
        this.userChatMessage +=
          this.chatterData[this.selectedChatter].user_name;
        this.showUserInChat = false;
      }

      event.preventDefault();
      return;
    }
    this.showUserInChat = false;

    if (event.key == "Enter" && !this.isConnected) {
      if (this.currentToastData.length < 1) {
        this.currentToastData.push({
          message: "Not connected to chat",
          duration: "5000",
        });
        this.showToast = true;
      }
      event.preventDefault();
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      this.userChatMessage += "\n";
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const token = await this.settings.getToken();
    this.accessToken = token;

    if (this.userChatMessage != "") {
      event.preventDefault();
      this.settings.checkAccessTokenValidity(token).subscribe((result) => {
        if (!result) {
          this.settings.showWarning("Your token is not valid. Please login again.","Invalid Token")
          return;
        }
      });
      this.settings
        .getUserId(token)
        .pipe(
          switchMap((userIdResult: any) => {
            const senderId = userIdResult;
            return this.settings
              .getBroadCasterId(this.accessToken, this.currentChannel)
              .pipe(
                switchMap((broadcasterIdResult: any) => {
                  const broadcasterId = broadcasterIdResult;
                  return this.chat.sendMessage(
                    this.currentChannel,
                    senderId,
                    broadcasterId,
                    this.userChatMessage,
                    token,
                  );
                }),
              );
          }),
        )
        .subscribe(
          (result: any) => {
            if (result.data[0].drop_reason) {
              this.currentToastData.push({
                message: result.data[0].drop_reason.message,
                duration: "5000",
              });
              this.showToast = true;
              return;
            }
            this.userChatMessage = "";
          },
          (error) => {
            console.error("Error sending message:", error);
          },
        );
    }
  }

  scrollToBottom() {
    if (this.scrollAuto) {
      const chat = this.chatBox.nativeElement;
      chat.scrollTop = chat.scrollHeight;
    }
  }

  onPasteUserInInput(user: string) {
    this.userChatMessage += user;
    this.showUserInChat = false;
  }

  @HostListener("wheel", ["$event"])
  onScroll(event: WheelEvent) {
    event.preventDefault();

    this.chatBox.nativeElement.scrollTop += event.deltaY * 2;
    if (this.chatter) {
      this.chatter.nativeElement.scrollTop += event.deltaY;
    }

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
  onMouseUp() {
    this.userScrolling = false;
    this.scrollAuto = true;
  }

  onDisconnect() {
    this.isConnected = false;
  }
  onConnect() {
    this.isConnected = true;
  }

  async loadChatMessages(channel: string) {
    this.isConnected = true;
    this.scrollToBottom();

    if (this.userData.token && this.userData.username) {
      this.chat.connect(this.userData.token, this.userData.username, channel);
      if (!this.sub || this.sub.closed) {
        this.sub = this.chat.messages$.subscribe((msg) => {
          this.messages.push(msg);
        });
        this.chat.getChatterBadge().subscribe((badges) => {
          this.chatterInfo.badges = badges;
          this.getImageForBadge();
        });
        this.chat.getChatterColor().subscribe((color) => {
          this.chatterInfo.color = color;
        });
      }
    }
  }

  getImageForBadge() {
    let a = this.chat.getImageFromBadgeName(
      this.chatterInfo.badges,
      this.channelBadgeInfo,
    );
    this.chatterInfo.badgeImages = a;

    //console.log("badge images found:");
    //for (const img of a) {
    //  console.log(img);
    //}
  }

  async getBadgesForChannel() {
    const channel: any = localStorage.getItem("channel");

    let subscriberBadges: string[];
    let bitsBadges: string[];
    this.settings
      .getBroadCasterId(this.userData.token, channel)
      .subscribe((response) => {
        const broadcaster_id = response;
        this.chat
          .getChannelBadges(broadcaster_id, this.userData.token)
          .subscribe((response: any) => {
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
              global: global_badges_json,
            };
          });
      });
  }

  async getGlobalBadges() {
    this.chat
      .getGlobalChatBadges(this.userData.token)
      .subscribe((response: any) => {
        localStorage.setItem("global_badges", JSON.stringify(response.data));
      });
  }

  async checkIfLoggedIn() {
    await this.initUserData();
    const loginStatus = localStorage.getItem("loginStatus");
    const loginValue = JSON.parse(loginStatus ?? "false");
    if (!loginValue) {
      this.currentChannel = "";
      this.placeholderString = "Login to send a message";
      this.currentToastData.push({
        message: "Please login!",
        duration: "5000",
      });
      this.showToast = true;
      this.loginStatus = false;
    } else {
      this.placeholderString = "Send a message as " + this.userData.username;
      this.initializeLoggedInFeatures();
      this.loginStatus = true;
    }
  }

  async initUserData() {
    const user = await this.settings.getStoredUsername();
    const token = await this.settings.getToken();
    this.userData = {
      username: user,
      token: token,
    };
  }

  async initializeLoggedInFeatures() {
    await this.setCurrentChannel();
    await this.loadChannelEmojisForChat();
    await this.loadEmojisForChat();
    await this.saveCurrentBroadCasterId();
    await this.initChatSettings();
    await this.initBadges();
    await this.loadChatMessages(this.currentChannel);
    const emoji: any = localStorage.getItem("emoji");
    window.addEventListener("storage", this.handleStorageChange);

    //this.applyUserSettings();
    this.settings.getUserId(this.userData.token).subscribe((id) => {
      this.settings.setUserId(id);
    });
    this.scrollChatbox();

    this.currChannelSub = this.settings
      .getCurrentChannel()
      .subscribe((result: any) => {
        if (result) {
          this.currentChannel = result;
        }
      });
  }

  logout() {
    this.chat.UserRelog();
    this.loadUserToken();
    this.settings.setLoginStatus(false);
  }

  loadUserToken() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get("access_token");
        this.settings.getUserInfo().subscribe((data: any) => {
          if (!data || !data.data || data.data.length === 0) {
            return;
          }
          let userData = {
            token: this.accessToken,
            username: data.data[0]["display_name"],
            id: data.data[0]["id"],
            desc: data.data[0]["description"],
            created_at: data.data[0]["created_at"],
            profile_image_url: data.data[0]["profile_image_url"],
          };
          this.settings.saveUserData(userData);
          this.settings
            .checkAccessTokenValidity(this.accessToken)
            .subscribe((result) => {
              if (!result) {
                this.settings.showWarning("Your token is not valid. Please login again.","Invalid Token")
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
    if (this.currentTabSub) {
      this.currentTabSub.unsubscribe();
    }
    window.removeEventListener("storage", this.handleStorageChange);
  }
}
