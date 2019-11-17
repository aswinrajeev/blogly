import { Component } from '@angular/core';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Blogly';
  version = '0.1.0';

  constructor(private navService: NavigationService) { 
  }

  // returns if the panel is closed
  isClosed() {
    return this.navService.isPanelHidden();
  }
}
