import { Component,OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
				username: string = "";

				constructor(private settings: SettingsService) {}

				ngOnInit() {
								this.settings.getUserName().subscribe(name => {
												this.username = name;
												console.log(name);
								});
				}

				onLogin(event: MouseEvent) {
								  const url = 'https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=ds3ban6ylu8w882wox7f1xyr9s7v56&redirect_uri=http://localhost:4200&scope=chat:read user:write:chat';
									window.location.href = url;
				}
}
