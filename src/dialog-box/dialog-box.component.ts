import { Component, OnInit, Inject, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AppComponent } from "../app/app.component";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TabService } from "../services/tab.service";
import { switchMap, map } from "rxjs/operators";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-dialog-box",
  imports: [FormsModule, CommonModule],
  templateUrl: "./dialog-box.component.html",
  styleUrl: "./dialog-box.component.css",
})
export class DialogBoxComponent implements OnInit, AfterViewInit {
  @ViewChild("container") containerDiv!: ElementRef;
  @ViewChild("broadcaster") broadcaster!: ElementRef;

  inputValue: string = "";
  currentChannel: string = "";
  tabName: string = "";

  previousPageCursor: string | null = null;
  previousPageCursorOriginal: string | null = null;
  nextPageCursor: string | null = null;
  cursorStack: string[] = [];
  currentPage: number = 0;
  followListData: any[] = [];
  paginationData: any[] = [];
  searchValue: string = "";
  searchResult: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settings: SettingsService,
    private chat: TwitchChatService,
    private tab: TabService,
  ) { }

  insertStreamerName(channel: string) {
    this.inputValue = channel;
  }



  ngAfterViewInit() {
    this.containerDiv.nativeElement.style.height = this.data.height;
  }

  onTabChange() {
    this.tab.addTab({ name: this.tabName });
    this.onClose();
  }

  ngOnInit() {
    const channel: any = localStorage.getItem("channel");
    this.currentChannel = channel;
    if (this.data.function == "show_users_follow_list") {
      this.initFollowList("", "");
    }
  }

  async initFollowList(cursor: string, type: string) {
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();


    this.settings.getFollowedChannels(token, user_id, 20, cursor, type).subscribe((response: any) => {
      this.cursorStack.push(response.pagination.cursor);
      this.followListData = response.data;
      this.paginationData = response.pagination;
      for (let i = 0; i < this.followListData.length; i++) {
        this.settings.getUserCardInfo(this.followListData[i]["broadcaster_name"], token).subscribe((response: any) => {
          this.followListData[i]["img"] = response.data[0].profile_image_url;
        })

        this.chat.getStreamInfo(this.followListData[i]["broadcaster_name"], token).subscribe((response: any) => {
          if (response.data.length > 0) {
            this.followListData[i]["live"] = true;
            this.followListData[i]["viewer"] = response.data[0]["viewer_count"];
          } else {
            this.followListData[i]["live"] = false;
          }
        })

      }
    });

  }

  nextPageFollowList() {
    this.broadcaster.nativeElement.scrollTop = 0;
    const cursor = this.cursorStack[this.cursorStack.length - 1];
    this.initFollowList(cursor, "after");
    this.currentPage += 1;
  }

  prevPageFollowList() {
    this.broadcaster.nativeElement.scrollTop = 0;
    const cursor = this.cursorStack[this.cursorStack.length - 2];
    this.initFollowList(cursor, "cursor");
    this.currentPage -= 1;
  }

  onSwitchChannel(value: string) {
    this.data.function = "change_channel_name";
    this.inputValue = value;
    this.data.message = "Type in a channel name";
    this.dialogRef.updateSize("400px", "200px");
  }

  onSwitchToFollowedChannel(name: string) {
    this.chat.disconnect();
    this.settings.setCurrentChannel(name);
    this.dialogRef.close();
  }

  onChannelNameSave() {
    if (!this.inputValue) {
      alert("Please enter a valid channel name");
      return;
    }

    if (this.currentChannel == this.inputValue) {
      alert("You are already connected with " + this.inputValue + "'s chat!");
      return;
    }

    this.chat.disconnect();
    this.settings.setCurrentChannel(this.inputValue);
    this.dialogRef.close();
  }

  onClose() {
    this.dialogRef.close();
  }
}
