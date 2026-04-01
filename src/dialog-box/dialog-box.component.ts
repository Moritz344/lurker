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
  inputValue: string = "";
  currentChannel: string = "";
  tabName: string = "";

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
