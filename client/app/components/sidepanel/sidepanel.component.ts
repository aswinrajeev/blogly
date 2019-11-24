import { Component, OnInit, ComponentFactoryResolver, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';
import { SidepaleholderDirective } from 'client/app/directives/sidepaleholder.directive';
import { PostlistComponent } from '../postlist/postlist.component';
import { SettingsComponent } from '../settings/settings.component';
import { BlogconfigsComponent } from '../blogconfigs/blogconfigs.component';
import { PostinfoComponent } from '../postinfo/postinfo.component';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnInit {

  title = 'Panel';
  @ViewChild(SidepaleholderDirective) panelHolder : SidepaleholderDirective

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private navService: NavigationService, private cdr : ChangeDetectorRef, private blogService:BlogService) { 
    this.navService.panelUpdated.on('panelUpdated', (panel) => {
      this.setPanel(panel);
    });
  }

  ngOnInit() {
    this.setPanel('posts');
    this.blogService.updateListener.on('panelUpdated', () => {
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
