import {
  Component,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { RouterOutlet, ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { SettingsService } from "../services/settings.service";


@Component({
  selector: "app-root",

  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit, OnDestroy {
  private storageListener: any;

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.settings.applyThemeFromStorage();

    this.storageListener = () => {
      this.settings.applyThemeFromStorage();
    };
    window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy() {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

}
