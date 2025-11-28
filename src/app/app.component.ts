import {
  Component,
  OnInit,
} from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {

	constructor() {}

	ngOnInit() {}

}
