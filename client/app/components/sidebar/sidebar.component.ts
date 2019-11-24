import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private navService: NavigationService, private blogService:BlogService) { 

  }

  ngOnInit() {
    this.blogService.menuListener.on('showSettings', (args) => {
      this.setActiveItem('settings');
      this.blogService.updateListener.emit('panelUpdated');
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
