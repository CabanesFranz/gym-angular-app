import { Component } from '@angular/core';
import { SidePanelService } from '../side-panel/side-panel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    private router: Router
  ) {}

  logout() {
    // Implement logout logic
    // This could involve clearing authentication tokens, redirecting to login, etc.
    this.router.navigate(['/login']);
  }
}
