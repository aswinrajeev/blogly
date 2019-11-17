import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  currentPanel: String;
  panelHidden: boolean = false;

  constructor() { }

  getCurrentPanel():String {
    return this.currentPanel;
  }

  setCurrentPanel(currentPanel:String) {
    this.currentPanel = currentPanel;
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
