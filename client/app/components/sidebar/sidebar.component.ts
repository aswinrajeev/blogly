import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for side bar
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  /**
   * Constructor for the sidebar component
   * @param __navService 
   * @param __eventManager 
   * @param __cdr 
   */
  constructor(
    private __navService: AppManagerService, 
    private __eventManager: EventmanagerService,
    private __cdr : ChangeDetectorRef) { 

  }

  /**
   * Intializes the menu listeners and UI update listener
   */
  ngOnInit() {
    // listens for show settings action
    this.__eventManager.getMenuEventEmitter().on('showSettings', (args) => {
      this.setActiveItem('settings');
      this.__eventManager.getUIEventEmitter().emit('panelUpdated');
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    // listens for any updates to UI
    this.__eventManager.getUIEventEmitter().on('uiUpdated', () => {
      this.__cdr.detectChanges();
    })
  }

  /**
   * Returns if the sidebar item is the active item
   * @param item 
   */
  isActiveItem(item) {
    return (this.__navService.getCurrentPanel() == item);
  }

  /**
   * Sets the item as the active item
   * @param item 
   */
  setActiveItem(item) {
    this.__navService.setCurrentPanel(item);
    this.__navService.setPanelHidden(false);
  }

}
