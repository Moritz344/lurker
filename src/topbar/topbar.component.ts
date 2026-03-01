import { Component, OnInit, OnChanges } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { SettingsComponent } from "../settings/settings.component";
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

// TODO: remove tabs/ update fetchStreamerInfo 
// TODO: work on styling

@Component({
  selector: "app-topbar",
  imports: [
    MatDialogModule,
    MatToolbarModule,
    DialogBoxComponent,
    MatButtonModule,
    SettingsComponent,
    CommonModule,
    ToastComponent,
    TabComponent,
    FormsModule,
  ],
  templateUrl: "./topbar.component.html",
  styleUrl: "./topbar.component.css",
})
export class TopbarComponent implements OnInit, OnChanges {
  currentChannel: string = "";
  showLoginButton: boolean = true;
  currentTabs: any;

  showToast: boolean = false;
  currentToastData: { message: string, duration: string }[] = [{ message: "", duration: "" }];

  constructor(
    private dialog: MatDialog,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private tab: TabService,
    private router: Router,
  ) {
    this.settings.getLoginStatus().subscribe((result) => {
      this.showLoginButton = !result;
    });
  }

  ngOnInit() {
    this.currentTabs = this.tab.getTabs();
    this.tab.removeTab(0);
  }

  onHideSingleToast(index: number) {
    this.currentToastData.splice(index, 1);
  }

  onHideToast() {
    this.currentToastData.length = 0;
  }

  onAddButton() {
    if (this.currentTabs.length >= 5) {
      this.showToast = true;
      this.currentToastData.push({ message: "You can open a maximum of 5 Tabs", duration: "5000" });
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
    for (let i = 0; i < this.currentTabs.length; i++) {
      if (this.currentTabs[i].name == item.name) {
        let itemToRemove = i;
        this.tab.removeTab(itemToRemove);
      }
    }

  }

  onChangeTab(tab: any) {
    this.tab.changeTab(tab);
  }

  ngOnChanges() { }

  onLogout() {
    this.chat.Userlogout();
    this.settings.setLoginStatus(false);
    this.showLoginButton = true;
  }

  onSettings() {
    this.settings.openSettings();
  }

  onSwitchChannel() {
    this.settings.setCurrentChannel(this.currentChannel);
  }

  onLogin() {
    this.settings.setLoginStatus(true);
    this.router.navigate(["auth"]);
  }
}
