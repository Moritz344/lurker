import { Component,Input,OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{
				@Input() message: string = "";

				currentDate = new Date().getHours() + ":" + new Date().getMinutes()+ " " ;
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

				constructor() {}

				ngOnInit() {
								const splitMessage = this.message.split(":");
								this.currentName = splitMessage[0];
								this.currentMessage = splitMessage[1];

								this.userColor = this.userColorArray[Math.floor(Math.random() * this.userColorArray.length)];

				}


}
