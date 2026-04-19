import { Component, inject } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {
  public settings = inject(SettingsService);

  constructor() { }

  onOpenExternalLink(link: string) {
    this.settings.openExternalLink(link);

  }

}
