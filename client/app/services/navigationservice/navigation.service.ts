import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  currentPanel: String;

  constructor() { }

  getCurrentPanel():String {
    return this.currentPanel;
  }

  setCurrentPanel(currentPanel:String) {
    this.currentPanel = currentPanel;
  }
}
