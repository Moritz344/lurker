import {
  Component,
  OnInit,
  signal,
  OnChanges,
  Output,
  EventEmitter,
  OnDestroy,
  HostListener,
} from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

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
    ToastComponent,
    TabComponent,
    FormsModule
],
  templateUrl: "./topbar.component.html",
  styleUrl: "./topbar.component.css",
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() clearChat = new EventEmitter<void>();
  @Output() disconnect = new EventEmitter<void>();
  @Output() connect = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() switchChannel = new EventEmitter<void>();

  public currentChannel: string = "";
  public showLoginButton: boolean = true;
  public currentTabs: any;
  public streamerData: any;

  public isChoosingChannel = signal(false);
  public isChoosingFollowerList = signal(false);

  public disableChannelNameHover = signal(false);

  public menuIsActive: boolean = false;

  public showToast: boolean = false;
  public currentToastData: { message: string; duration: string }[] = [];

  public username: string = "";
  public showMenuOptions: boolean = false;
  public isConnected: boolean = true;
  public channelNameHover: boolean = false;
  public loginStatus: boolean = true;

  chatSettings: any;

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
      }),
    );
  }

  @HostListener("window:keydown", ["$event"])
  handleKeybinds(event: KeyboardEvent) {
    if (event.ctrlKey && event.key == "s") {
      this.dialog.closeAll();
      this.onChooseChannel();
    } else if (event.ctrlKey && event.key == "f") {
      this.dialog.closeAll();
      this.onOpenUserFollowList();
    } else if (event.ctrlKey && event.key == "o") {
      this.onOpenStreamInBrowser();
    } else if (event.ctrlKey && event.key == "m") {
      this.onOpenModView();
    } else if (event.ctrlKey && event.key == "d") {
      this.onDisconnect();
    } else if (event.ctrlKey && event.key == "r") {
      this.onReconnect();
    } else if (event.ctrlKey && event.key == "q") {
      this.onExit();
    } else if (event.key == "Escape") {
      this.showMenuOptions = false;
    }
  }

  onOpenUserFollowList() {
    this.dialog.open(DialogBoxComponent, {
      width: "400px",
      height: "450px",
      panelClass: "container",
      data: {
        message: "Follow List",
        function: "show_users_follow_list",
      },
    });
    this.showMenuOptions = false;
  }

  async ngOnInit() {
    this.currentTabs = this.tab.getTabs();
    this.tab.removeTab(0);
    this.username = await this.settings.getStoredUsername();

    const loginStatus = localStorage.getItem("loginStatus");
    const loginValue = JSON.parse(loginStatus ?? "false");
    this.loginStatus = loginValue;
    if (this.loginStatus) {
      const channel = await this.settings.getStoredUsername();
      if (channel && channel !== this.currentChannel) {
        this.currentChannel = channel;
        this.onSwitchChannel(channel);
      }
    }

    this.subscriptions.push(
      this.tab.currentTab$.subscribe((tab) => {
        if (tab.name) {
          this.currentChannel = tab.name;
          this.onSwitchChannel(tab.name);
        }
      }),
      this.settings.getCurrentChannel().subscribe((result) => {
        if (result && result !== this.currentChannel) {
          this.currentChannel = result;
          this.onSwitchChannel(result);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onClearChat() {
    this.clearChat.emit();
  }

  async onReconnect() {
    const token = await this.settings.getToken();
    const username = await this.settings.getStoredUsername();
    const channel: any = localStorage.getItem("channel");
    this.chat.connect(token, username, channel);
  }

  onDisconnect() {
    this.isConnected = false;
    this.disconnect.emit();
    this.chat.disconnect();
  }

  onConnect() {
    this.isConnected = true;
    this.connect.emit();
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
    this.showMenuOptions = false;
  }

  async onSwitchChannel(name: string) {
    localStorage.setItem("channel", name);
    this.currentChannel = name;
    const token = await this.settings.getToken();
    this.chat.fetchStreamerInfo(name, token).subscribe((info) => {
      this.streamInfoToShow = info;
    });
    this.saveCurrentBroadcasterId();
    this.connectChat(name);
    this.clearChat.emit();
    this.showMenuOptions = false;
  }

  async saveCurrentBroadcasterId() {
    const token = await this.settings.getToken();
    this.settings
      .getBroadCasterId(token, this.currentChannel)
      .subscribe((id: string) => {
        localStorage.setItem("broadcaster_id", id);
        this.switchChannel.emit();
      });
  }

  async connectChat(channel: string) {
    const username = await this.settings.getStoredUsername();
    const token = await this.settings.getToken();
    this.chat.connect(token, username, channel);
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

  onMenu() {
    this.showMenuOptions = !this.showMenuOptions;
  }

  onAddButton() {
    if (this.currentTabs.length >= 3) {
      this.settings.showWarning("You can only have 3 Tabs max!","Tabs");
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
    this.tab.setConnectedStatusForAllFalse();
    tab.connected = true;
    this.tab.changeTab(tab);
  }

  onLogout() {
    this.currentChannel = "";
    this.disableChannelNameHover = signal(true);
    this.showLoginButton = true;
    this.loginStatus = false;
    this.logout.emit();
    this.settings.logout();
    this.chat.disconnect();
  }

  onSettings() {
    this.settings.openSettings();
  }

  onLogin() {
    this.showLoginButton = false;
    this.settings.setLoginStatus(true);
    this.router.navigate(["auth"]);
  }
}
