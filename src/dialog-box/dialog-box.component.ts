import { Component, OnInit,Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../app/app.component';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, map } from 'rxjs/operators';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-box',
  imports: [FormsModule,CommonModule],
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.css'
})
export class DialogBoxComponent implements OnInit {

				inputValue: string = "";
				currentChannel: string = "";
				inputValueAnnouncement: string = "";
				isOwner = false;

				constructor(
				      private dialogRef: MatDialogRef<AppComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
				      private settings: SettingsService,
							private chat: TwitchChatService) {
				}

				checkIfUserIsOwner(result: string) {
												const token: any = localStorage.getItem("twitch_token");
												const user_id: any = localStorage.getItem("user_id");
												this.settings.getBroadCasterId(token,result).subscribe(id => {
																						if (user_id === id) {
																										this.isOwner = true;
																										return;
																						}
																		});
				}

				ngOnInit() {
								this.settings.getCurrentChannel().subscribe( result => {
												this.currentChannel = result;
												this.inputValue = result;
												this.checkIfUserIsOwner(result);
								});
				}


				onAnnouncementSave() {
								let isMod = this.settings.checkIfUserIsModerator(this.currentChannel);
								if (isMod || this.isOwner) {
												const token: any = localStorage.getItem("twitch_token");
												const username: any = localStorage.getItem("username");
												const user_id: any = localStorage.getItem("user_id");
												this.settings.getBroadCasterId(token,this.currentChannel).subscribe(result => {
																				this.chat.sendAnnouncement(result,user_id,this.inputValueAnnouncement,"purple",token).subscribe(result => {
																				});
												});
								}else{
												alert("Looks like you are not a moderator here");
								}

								this.onClose();
				}

				onChannelNameSave() {
								if (!this.inputValue ) {
												alert("please name a channel name")
												return;
								}else if (this.inputValue.length > 25 || this.inputValue.length < 4) {
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
