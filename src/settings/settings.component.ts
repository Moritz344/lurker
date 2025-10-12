import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../services/settings.service';
import { GeneralComponent } from './general/general.component';
import { AccountComponent } from './account/account.component';
import { AboutComponent } from './about/about.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule,FormsModule,GeneralComponent,AccountComponent,AboutComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {

				currentChannel: string = "";
				settingsOption: string = "";

				constructor(private dialogRef: MatDialogRef<SettingsComponent>,
									  private settings: SettingsService) {}

				onSwitch() {
								this.settings.setCurrentChannel(this.currentChannel);
				}

				onSettings(option: string) {
								this.settingsOption = option;

				}

				onClose() {
								this.dialogRef.close();
				}

}
