import { Component,Input,OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule,FormsModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit{

								title = "";
								infos: any;


								constructor(public settings: SettingsService,
																			) {
																const b: any = localStorage.getItem("next-user-card");
    												const settingsJson = JSON.parse(b);
																this.infos = settingsJson;
								}


								ngOnInit() {
								}



}
