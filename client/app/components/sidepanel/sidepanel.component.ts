import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';
import { SidepaleholderDirective } from 'client/app/directives/sidepaleholder.directive';
import { PostlistComponent } from '../postlist/postlist.component';
import { SettingsComponent } from '../settings/settings.component';
import { BlogconfigsComponent } from '../blogconfigs/blogconfigs.component';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnInit {

  title = 'Panel';
  @ViewChild(SidepaleholderDirective) panelHolder : SidepaleholderDirective

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private navService: NavigationService) { 
    this.navService.panelUpdated.on('panelUpdated', (panel) => {
      this.setPanel(panel);
    });
  }

  ngOnInit() {
    this.setPanel('posts');
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
        this.title = 'Post Configs';
        break;
    }

    const viewRef = this.panelHolder.viewContainerRef;
    viewRef.clear();

    const componentRef = viewRef.createComponent(componentFactory);
  }



}
