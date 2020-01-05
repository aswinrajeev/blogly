import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private navService: AppManagerService, private appManager:AppManagerService, private blogService:PostManagerService, private cdr : ChangeDetectorRef) { 

  }

  ngOnInit() {
    this.appManager.getMenuEventEmitter().on('showSettings', (args) => {
      this.setActiveItem('settings');
      this.blogService.postUpdateListener.emit('panelUpdated');
    });
  }

  // returns if the current item is the one selected or not
  isActiveItem(item) {
    return (this.navService.getCurrentPanel() == item);
  }

  // sets the active panel
  setActiveItem(item) {
    this.navService.setCurrentPanel(item);
    this.navService.setPanelHidden(false);
  }

}
