import { Component } from '@angular/core';
import { MatDialog} from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SettingsComponent } from '../settings/settings.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-topbar',
  imports: [ MatDialogModule,MatButtonModule,SettingsComponent,CommonModule,FormsModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {

				currentChannel: string = ""

				constructor(private dialog: MatDialog,private settings: SettingsService) {}

				onSettings() {
								this.dialog.open(SettingsComponent, {
												width: '500px',
												panelClass: 'container'
								});
				}

				onSwitchChannel() {
								this.settings.setCurrentChannel(this.currentChannel);
				}

				onLogin() {
								  const url = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200&scope=chat:read user:write:chat';
									window.location.href = url;


				}

}
