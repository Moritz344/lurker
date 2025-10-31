import { Component,Input,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{
				@Input() message: string = "";

				currentDate: string = "";
				currentName: string = ""
				currentMessage: string = "";
				userColorArray: string[]  = [
								"#FFA500", // Orange
    						"#FF4500", // Orangered
    						"#FF0000", // Red
    						"#FFFF00", // Yellow
    						"#00FF00", // Lime
    						"#0000FF", // Blue
    						"#8A2BE2", // BlueViolet
    						"#4B0082", // Indigo
    						"#FF69B4", // HotPink
    						"#D2691E", // Chocolate
    						"#FF8C00", // DarkOrange
    						"#ADFF2F", // GreenYellow
    						"#20B2AA", // LightSeaGreen
    						"#FFD700", // Gold
    						"#32CD32", // LimeGreen
    						"#7B68EE", // MediumSlateBlue
    						"#FF1493"  // DeepPink
				];
				userColor: string = "white";

				constructor(public settings: SettingsService) {}


				ngOnInit() {
								const splitMessage = this.message.split(":");
								this.currentName = splitMessage[0];
								this.currentMessage = splitMessage[1];

								let state = this.settings.getUserColorStatus();
								if (state == "disabled") {
												this.userColor = "white";
								}else {
												this.userColor = this.userColorArray[Math.floor(Math.random() * this.userColorArray.length)];
								}

								let timestampFormat = this.settings.getUserTimestampFormat();
								if (timestampFormat == undefined) { timestampFormat === "h:mm"; }

								let hours = "";
								if (Number(new Date().getHours()) < 10) {
												hours = new Date().getHours()  + ":" + "0";
								}else {
												hours = new Date().getHours().toString() + ":";
								}
								if (timestampFormat !== "disabled") {
												this.currentDate = hours + new Date().getMinutes();
								}

								if (timestampFormat == "h:mm:ss") {
												this.currentDate += ":" + new Date().getSeconds() + " ";
								}else if (timestampFormat == "h:mm") {
												this.currentDate += " ";
								}

				}


}
