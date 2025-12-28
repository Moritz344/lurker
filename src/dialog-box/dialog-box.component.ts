import { Component, OnInit, Inject } from "@angular/core";
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
export class DialogBoxComponent implements OnInit {
  inputValue: string = "";
  currentChannel: string = "";
  inputValueAnnouncement: string = "";
  isOwner = false;
  followData: any;
  followList: string[] = [];
  nextPageCursor: string = "";

  inputValuePollTitle: string = "";
  inputValueChoice_1: string = "";
  inputValueChoice_2: string = "";
  inputValueChoice_3: string = "";
  inputValueChoice_4: string = "";
  inputValueChoices: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private settings: SettingsService,
    private chat: TwitchChatService,
  ) { }

  checkIfUserIsOwner(result: string) {
    if (!result) { return; }
    const token: any = localStorage.getItem("twitch_token");
    const user_id: any = localStorage.getItem("user_id");
    this.settings.getBroadCasterId(token, result).subscribe((id) => {
      if (user_id === id) {
        this.isOwner = true;
        return;
      }
    });
  }

  insertStreamerName(channel: string) {
    this.inputValue = channel;
  }

  loadDataForChooseChannelName(direction: string) {
    this.followList.length = 0;
    const userId: any = localStorage.getItem("user_id");
    if (direction === "forwards" || direction === "") {
      this.chat
        .getUserFollows(userId, 6, this.nextPageCursor, "")
        .subscribe((result: any) => {
          this.followData = result;
          this.setFollowerList();
        });
    } else if (direction === "backwards") {
      this.chat
        .getUserFollows(userId, 6, "", this.nextPageCursor)
        .subscribe((result: any) => {
          this.followData = result;
          this.setFollowerList();
        });
    }
  }

  setFollowerList() {
    if (this.followData && this.followData.data) {
      for (let follow of this.followData.data) {
        this.followList.push(follow.broadcaster_name);
      }
    }
    this.nextPageCursor = this.followData.pagination.cursor;
  }

  ngOnInit() {
    const user: any = localStorage.getItem("username");
    this.currentChannel = user;
    this.settings.getCurrentChannel().subscribe((result) => {
      this.currentChannel = result;
      this.inputValue = result;
      this.checkIfUserIsOwner(this.currentChannel);
    });

    this.loadDataForChooseChannelName("");
  }


  onChannelNameSave() {
    if (!this.inputValue) {
      alert("please name a channel name");
      return;
    } else if (this.inputValue.length > 25 || this.inputValue.length < 4) {
      alert("please enter a valid channel name");
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
