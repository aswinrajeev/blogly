import { Component, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { PostManagerService } from './services/postmanager/postmanager.service';
import { EventmanagerService } from './services/event/eventmanager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Blogly';
  version = '0.1.0';

  /**
   * Constructor for the main app component
   * @param navService 
   * @param blogService 
   * @param __eventManager 
   * @param cdr 
   */
  constructor(
    private navService: AppManagerService, 
    private blogService: PostManagerService, 
    private __eventManager: EventmanagerService,
    private cdr: ChangeDetectorRef) { 
    // listens for any UI updates
    this.__eventManager.getUIEventEmitter().on('uiUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // returns if the panel is closed
  isClosed() {
    return this.navService.isPanelHidden();
  }
}
