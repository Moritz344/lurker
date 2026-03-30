import { Component, OnInit, OnChanges, Output, EventEmitter, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../services/settings.service";
import { TabService } from "../services/tab.service";
import { ToastComponent } from "../toast/toast.component";
import { TwitchChatService } from "../services/twitchChat.service";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { TabComponent } from "./tab/tab.component";
import { DialogBoxComponent } from "../dialog-box/dialog-box.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-topbar",
  imports: [
    MatDialogModule,
    MatToolbarModule,
    DialogBoxComponent,
    MatButtonModule,
    CommonModule,
    ToastComponent,
    TabComponent,
    FormsModule,
  ],
  templateUrl: "./topbar.component.html",
  styleUrl: "./topbar.component.css",
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() clearChat = new EventEmitter<void>();
  public currentChannel: string = "";
  public showLoginButton: boolean = true;
  public currentTabs: any;
  public streamerData: any;

  public showToast: boolean = false;
  public currentToastData: { message: string, duration: string }[] = [];

  public username: string = "";
  public showVerticalMenuOptions: boolean = false;
  public isConnected: boolean = true;
  public channelNameHover: boolean = false;
  public loginStatus: boolean = true;

  chatSettings: any;
  channelBadgeInfo: { bits: any, subscriber: any, global: any } = { bits: "", subscriber: "", global: "" };

  streamInfoToShow: { title: string, thumbnail: string, game_name: string, viewer_count: string } = {
    title: "",
    thumbnail: "",
    game_name: "",
    viewer_count: ""
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private dialog: MatDialog,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private tab: TabService,
    private router: Router,
  ) {
    this.subscriptions.push(
      this.settings.getLoginStatus().subscribe((result) => {
        this.showLoginButton = !result;
      })
    );
  }

  ngOnInit() {
    this.currentTabs = this.tab.getTabs();
    this.tab.removeTab(0);
    this.username = localStorage.getItem("username") || "";

    this.subscriptions.push(
      this.tab.currentTab$.subscribe((tab) => {
        if (tab.name) {
          this.currentChannel = tab.name;
          this.onSwitchChannel(tab.name);
        }
      }),
      this.settings.getLoginStatus().subscribe((result) => {
        this.loginStatus = result;
        if (result) {
          this.username = localStorage.getItem("username") || "";
          const channel = localStorage.getItem("channel");
          if (channel && channel !== this.currentChannel) {
            this.currentChannel = channel;
            this.onSwitchChannel(channel);
          }
        }
      }),
      this.settings.getCurrentChannel().subscribe((result) => {
        if (result && result !== this.currentChannel) {
          this.currentChannel = result;
          this.onSwitchChannel(result);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  onClearChat() {
    this.clearChat.emit();
  }

  onDisconnect() {
    this.isConnected = false;
    this.chat.disconnect();
  }

  onConnect() {
    this.isConnected = true;
    this.connectChat(this.currentChannel);
  }

  onExit() {
    this.settings.exit();
  }

  onHideSingleToast(index: number) {
    this.currentToastData.splice(index, 1);
  }

  onHideToast() {
    this.currentToastData = [];
  }

  onChooseChannel() {
    if (!this.loginStatus) return;
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "220px",
      panelClass: "container",
      data: {
        message: "Type in a channel name",
        function: "change_channel_name",
      },
    });
    this.showVerticalMenuOptions = false;
  }


  onSwitchChannel(name: string) {
    localStorage.setItem("channel", name);
    //if (this.currentChannel == name) {
    //  alert("You are already connect with" + name + "'s chat");
    //  return;
    //}
    this.currentChannel = name;
    this.chat.fetchStreamerInfo(name).subscribe((info) => {
      this.streamInfoToShow = info;
      console.log("info:", info);
    });
    this.saveCurrentBroadcasterId();
    this.connectChat(name);
    this.clearChat.emit();
    this.showVerticalMenuOptions = false;
  }

  private saveCurrentBroadcasterId() {
    const token: any = localStorage.getItem("twitch_token");
    this.settings.getBroadCasterId(token, this.currentChannel).subscribe((id: string) => {
      localStorage.setItem("broadcaster_id", id);
    });
  }

  connectChat(channel: string) {
    const token: any = localStorage.getItem("twitch_token");
    const username: any = localStorage.getItem("username");
    console.log(token, username, channel);
    this.chat.connect(token, username, channel);
  }

  private getBadgesForChannel() {
    const token: any = localStorage.getItem("twitch_token");
    let subscriberBadges: string[];
    let bitsBadges: string[];

    this.settings.getBroadCasterId(token, this.currentChannel).subscribe((broadcaster_id: string) => {
      this.chat.getChannelBadges(broadcaster_id).subscribe((response: any) => {
        if (response.data.length > 0) {
          for (const badge of response.data) {
            if (badge.set_id === "subscriber") subscriberBadges = badge.versions;
            else if (badge.set_id === "bits") bitsBadges = badge.versions;
          }
        }
        const global_badges = JSON.parse(localStorage.getItem("global_badges") || "[]");
        this.channelBadgeInfo = { subscriber: subscriberBadges, bits: bitsBadges, global: global_badges };
      });
    });
  }

  onChatterList() {
    this.settings.openChatterList();
  }

  onChannelNameHover() {
    if (!this.loginStatus) return;
    this.channelNameHover = !this.channelNameHover;
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

  onAddButton() {
    if (this.currentTabs.length >= 3) {
      this.currentToastData.push({ message: "You can open a maximum of 3 Tabs", duration: "5000" });
      this.showToast = true;
      return;
    }
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "220px",
      panelClass: "container",
      data: {
        message: "Type in a channel name",
        function: "add_tab",
      },
    });
  }

  onRemoveTab(item: any) {
    const index = this.currentTabs.findIndex((t: any) => t.name === item.name);
    if (index !== -1) {
      this.tab.removeTab(index);
    }
  }

  onChangeTab(tab: any) {
    this.tab.changeTab(tab);
  }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.showLoginButton = true;
  }

  onSettings() {
    this.settings.openSettings();
  }

  onLogin() {
    this.settings.setLoginStatus(true);
    this.router.navigate(["auth"]);
  }
}
