import { Component,Input,OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit{
				@Input() message: string = "";
				@Input() color: string = "";

				currentDate = new Date().getHours() + ":" + new Date().getMinutes()+ " " ;
				currentName: string = ""
				currentMessage: string = "";

				constructor() {}

				ngOnInit() {
								const splitMessage = this.message.split(":");
								this.currentName = splitMessage[0];
								this.currentMessage = splitMessage[1];
				}


}
