import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidePanelService {
  private _isOpen = new BehaviorSubject<boolean>(true);
  isOpen$ = this._isOpen.asObservable();

  toggleSidePanel() {
    this._isOpen.next(!this._isOpen.value);
  }
}
