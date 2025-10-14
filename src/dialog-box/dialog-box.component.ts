import { Component } from '@angular/core';
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
export class DialogBoxComponent {

				inputValue: string = "";

				constructor( private dialogRef: MatDialogRef<AppComponent>,
										private settings: SettingsService,
									 private chat: TwitchChatService) {}

				onSave() {
								this.chat.disconnect();
								this.settings.setCurrentChannel(this.inputValue);
								this.dialogRef.close();
				}

				onClose() {
								this.dialogRef.close();
				}

}
