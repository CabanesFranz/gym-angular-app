import { Component } from '@angular/core';
import { SidePanelService } from './dashboard/side-panel/side-panel.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public sidePanelService: SidePanelService) {}
}
