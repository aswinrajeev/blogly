import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  currentPanel: String;
  panelHidden: boolean = false;
  panelUpdated: EventEmitter = new EventEmitter();

  constructor() { }

  getCurrentPanel():String {
    return this.currentPanel;
  }

  setCurrentPanel(currentPanel:String) {
    this.currentPanel = currentPanel;
    this.panelUpdated.emit('panelUpdated', currentPanel);
  }

  // returns if panel is hidden
  isPanelHidden() {
    return this.panelHidden;
  }

  // sets panel hidden attribute
  setPanelHidden(close:boolean) {
    this.panelHidden = close;
  }

}
