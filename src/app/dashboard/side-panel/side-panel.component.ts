import { Component, OnInit } from '@angular/core';
import { SidePanelService } from './side-panel.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})
export class SidePanelComponent implements OnInit {
  isOpen$: Observable<boolean>;

  constructor(private sidePanelService: SidePanelService) {
    this.isOpen$ = this.sidePanelService.isOpen$;
  }

  ngOnInit() {}

  toggleSidePanel() {
    this.sidePanelService.toggleSidePanel();
  }
}
