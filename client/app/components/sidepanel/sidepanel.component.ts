import { Component, OnInit, ComponentFactoryResolver, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { SidepaleholderDirective } from 'client/app/directives/sidepaleholder.directive';
import { PostlistComponent } from '../postlist/postlist.component';
import { SettingsComponent } from '../settings/settings.component';
import { BlogconfigsComponent } from '../blogconfigs/blogconfigs.component';
import { PostinfoComponent } from '../postinfo/postinfo.component';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnInit {

  title = 'Panel';
  @ViewChild(SidepaleholderDirective) panelHolder : SidepaleholderDirective

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private navService: AppManagerService, private cdr : ChangeDetectorRef, private blogService:PostManagerService) { 
    this.navService.getUIEventEmitter().on('panelUpdated', (panel) => {
      this.setPanel(panel);
    });
  }

  ngOnInit() {
    this.setPanel('posts');
    this.blogService.postUpdateListener.on('panelUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // closes the panel
  close() {
   this.navService.setPanelHidden(true);
  }

  setPanel(panel:String) {

    var componentFactory;
    
    switch(panel) {
      case '':
      case 'posts':
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(PostlistComponent);
        this.title = "Posts";
        break;
      case 'settings':
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(SettingsComponent);
        this.title = "Settings"
        break;
      case 'configs':
        componentFactory = this.componentFactoryResolver.resolveComponentFactory(BlogconfigsComponent);
        this.title = 'Post Configurations';
        break;
      case 'postinfo':
          componentFactory = this.componentFactoryResolver.resolveComponentFactory(PostinfoComponent);
          this.title = 'Post Info';
          break;
    }

    const viewRef = this.panelHolder.viewContainerRef;
    viewRef.clear();

    const componentRef = viewRef.createComponent(componentFactory);
  }



}
