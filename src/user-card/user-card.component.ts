import { Component,Input,OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit {

								title = "";

								ngOnInit() {
																this.openDialog();
								}

								openDialog() {
								}

								constructor(public settings: SettingsService) {
								}

}
