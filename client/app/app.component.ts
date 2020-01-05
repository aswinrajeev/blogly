import { Component, ChangeDetectorRef } from '@angular/core';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { PostManagerService } from './services/postmanager/postmanager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Blogly';
  version = '0.1.0';

  constructor(private navService: AppManagerService, private blogService: PostManagerService, private cdr: ChangeDetectorRef) { 
    this.blogService.postUpdateListener.on('panelUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // returns if the panel is closed
  isClosed() {
    return this.navService.isPanelHidden();
  }
}
