import { Component, OnInit, ComponentFactoryResolver, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { SidepaleholderDirective } from 'client/app/directives/sidepaleholder.directive';
import { PostlistComponent } from '../postlist/postlist.component';
import { SettingsComponent } from '../settings/settings.component';
import { BlogconfigsComponent } from '../blogconfigs/blogconfigs.component';
import { PostinfoComponent } from '../postinfo/postinfo.component';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for the side panel
 */
@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnInit {

  title = 'Panel';
  @ViewChild(SidepaleholderDirective) panelHolder : SidepaleholderDirective

  constructor(
      private __componentFactoryResolver: ComponentFactoryResolver, 
      private __navService: AppManagerService, 
      private __cdr : ChangeDetectorRef, 
      private __eventManager: EventmanagerService
    ) { 
    }
  
  /**
   * Initializes the listeners and sets the active panel as post list
   */
  ngOnInit() {
      
    this.setPanel('posts');
      
    this.__eventManager.getUIEventEmitter().on('panelUpdated', (panel) => {
      this.setPanel(panel);
    });

    //listens for any updates to the UI
    this.__eventManager.getUIEventEmitter().on('uiUpdated', () => {
      this.__cdr.detectChanges();
    })
  }

  /**
   * Handles close of the panel
   */
  close() {
   this.__navService.setPanelHidden(true);
  }

  /**
   * Sets a panel as the active panel
   * @param panel 
   */
  setPanel(panel:String) {

    var componentFactory;
    
    switch(panel) {
      case '':
      case 'posts':
        componentFactory = this.__componentFactoryResolver.resolveComponentFactory(PostlistComponent);
        this.title = "Posts";
        break;
      case 'settings':
        componentFactory = this.__componentFactoryResolver.resolveComponentFactory(SettingsComponent);
        this.title = "Settings"
        break;
      case 'configs':
        componentFactory = this.__componentFactoryResolver.resolveComponentFactory(BlogconfigsComponent);
        this.title = 'Post Configurations';
        break;
      case 'postinfo':
          componentFactory = this.__componentFactoryResolver.resolveComponentFactory(PostinfoComponent);
          this.title = 'Post Info';
          break;
    }

    const viewRef = this.panelHolder.viewContainerRef;
    viewRef.clear();

    const componentRef = viewRef.createComponent(componentFactory);
  }
}
