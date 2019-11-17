import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';

@Component({
  selector: 'app-sidepanel',
  templateUrl: './sidepanel.component.html',
  styleUrls: ['./sidepanel.component.scss']
})
export class SidepanelComponent implements OnInit {

  title = 'Panel';

  constructor(private router:Router, private navService: NavigationService) { 

    // reflect any changes on the router to the nav service
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (router.url == '/' || router.url == '' ) {
          this.title = 'Posts';
          this.navService.setCurrentPanel('posts');
        }
      }
    })

  }

  ngOnInit() {
  }

  // closes the panel
  close() {
   this.navService.setPanelHidden(true);
  }

}
