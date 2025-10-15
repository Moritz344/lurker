import { Component, OnInit} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppComponent } from '../app/app.component';
import { SettingsService } from '../services/settings.service';
import { TwitchChatService } from '../services/twitchChat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-dialog-box',
  imports: [FormsModule,CommonModule],
  templateUrl: './dialog-box.component.html',
  styleUrl: './dialog-box.component.css'
})
export class DialogBoxComponent implements OnInit {

				inputValue: string = "";
				currentChannel: string = "";

				constructor( private dialogRef: MatDialogRef<AppComponent>,
										private settings: SettingsService,
									 private chat: TwitchChatService) {}

				ngOnInit() {
								this.settings.getCurrentChannel().subscribe( result => {
												this.currentChannel = result;
												this.inputValue = result;
								});
				}

				onSave() {
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
