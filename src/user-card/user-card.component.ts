import { Component,Input,OnInit,OnDestroy } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit,OnDestroy{

		title = "";
		infos: any;


		constructor(public settings: SettingsService) {
								const b: any = localStorage.getItem("next-user-card");
    						const settingsJson = JSON.parse(b);
                this.infos = settingsJson;
		}
    
    onUserCard() {
        // https://www.twitch.tv/popout/norman/viewercard/Troid23156
        this.settings.openExternalLink("https://twitch.tv/popout/norman/viewercard/" + this.infos.display_name );
    }


    ngOnDestroy() {
      localStorage.removeItem("next-user-card");
    }
    
		onTimeout() {
			
		}

		ngOnInit() {
		}



}
