import { Component, OnInit, Inject, ElementRef, signal, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AppComponent } from "../app/app.component";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { FormsModule } from "@angular/forms";

import { TabService } from "../services/tab.service";
import { switchMap, map } from "rxjs/operators";
import { forkJoin } from "rxjs";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

// TODO: Follow list loading indicator

@Component({
  selector: "app-dialog-box",
  imports: [FormsModule],
  templateUrl: "./dialog-box.component.html",
  styleUrl: "./dialog-box.component.css",
})
export class DialogBoxComponent implements OnInit, AfterViewInit {
  @ViewChild("container") containerDiv!: ElementRef;
  @ViewChild("broadcaster") broadcaster!: ElementRef;

  public inputValue: string = "";
  public currentChannel: string = "";
  public tabName: string = "";

  public isLoadingFollowList = signal(false);

  public previousPageCursor: string | null = null;
  public previousPageCursorOriginal: string | null = null;
  public nextPageCursor: string | null = null;
  public cursorStack: string[] = [];
  public currentPage: number = 0;
  public followListData: any[] = [];
  public paginationData: any[] = [];
  public searchValue: string = "";
  public searchResult: string[] = [];

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
    this.tab.addTab({ name: this.tabName,connected: false });
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
    this.isLoadingFollowList.update((x: boolean) => x = true);
    const token = await this.settings.getToken();
    const user_id = await this.settings.getStoredUserId();

    this.settings.getFollowedChannels(token, user_id, 20, cursor, type).subscribe((response: any) => {
      this.cursorStack.push(response.pagination.cursor);
      this.followListData = response.data;
      this.paginationData = response.pagination;

      const detailRequests = this.followListData.map((item, i) => {
        return forkJoin({
          userCard: this.settings.getUserCardInfo(item["broadcaster_name"], token),
          stream: this.chat.getStreamInfo(item["broadcaster_name"], token)
        }).pipe(map((results: any) => {
          if (results.userCard.data[0]) {
            this.followListData[i]["img"] = results.userCard.data[0].profile_image_url;
          }
          if (results.stream.data.length > 0) {
            this.followListData[i]["live"] = true;
            this.followListData[i]["viewer"] = results.stream.data[0]["viewer_count"];
          } else {
            this.followListData[i]["live"] = false;
          }
          return this.followListData[i];
        }));
      });

      forkJoin(detailRequests).subscribe(() => {
        this.isLoadingFollowList.update((x: boolean) => x = false);
        this.followListData.sort( ((a: any,b: any) => Number(b.live) - Number(a.live)));
      });
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
    if (this.inputValue.length < 4) {
      this.settings.showWarning("The channel name must be more then 4 character's!","Invalid Input");
      return;

    }

    if (this.currentChannel == this.inputValue) {
      this.settings.showWarning("You are already connected with " + this.inputValue + "'s chat!","Already Connected");
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
