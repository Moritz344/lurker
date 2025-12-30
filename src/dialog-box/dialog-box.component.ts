import { Component, OnInit, Inject, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { AppComponent } from "../app/app.component";
import { SettingsService } from "../services/settings.service";
import { TwitchChatService } from "../services/twitchChat.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
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
  inputValue: string = "";
  currentChannel: string = "";

  currentPageCursor: string = '';
  previousPageCursor: string = '';
  nextPageCursor: string = "";
  followList: any;
  searchValue: string = "";
  searchResult: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settings: SettingsService,
    private chat: TwitchChatService,
  ) { }

  insertStreamerName(channel: string) {
    this.inputValue = channel;
  }

  loadPage(cursor: string) {
    const user_id: any = localStorage.getItem("user_id");

    this.chat
      .getUserFollows(user_id, 50, cursor, "")
      .subscribe((response: any) => {
        this.currentPageCursor = cursor;
        this.nextPageCursor = response.pagination.cursor;
        this.followList = response.data;
        console.log(response);
      });
  }

  onSearch() {
    this.searchResult.length = 0;
    console.log("search!", this.searchValue);
    for (let i = 0; i < this.followList.length; i++) {
      if (this.followList[i]["broadcaster_name"].includes(this.searchValue)) {
        this.searchResult.push(this.followList[i]["broadcaster_name"]);
      }
    }
  }

  onNextPage() {
    this.searchResult.length = 0;
    this.previousPageCursor = this.currentPageCursor;
    this.loadPage(this.nextPageCursor);
  }
  onPreviousPage() {
    this.searchResult.length = 0;
    if (this.previousPageCursor) {
      this.loadPage(this.previousPageCursor);
      this.previousPageCursor = '';
    }
  }


  ngAfterViewInit() {
    this.containerDiv.nativeElement.style.height = this.data.height;
    console.log(this.data.height);
  }

  ngOnInit() {
    const channel: any = localStorage.getItem("channel");
    this.currentChannel = channel;

    this.loadPage("");


  }

  onSwitchChannel(value: string) {
    this.data.function = "change_channel_name";
    this.inputValue = value;
    this.data.message = "Type in a channel name";
    this.dialogRef.updateSize("400px", "200px");
  }

  onChannelNameSave() {
    if (!this.inputValue) {
      alert("Please enter a valid channel name");
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
