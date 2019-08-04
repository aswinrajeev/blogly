import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private router:Router, private navService: NavigationService) { 

  }

  ngOnInit() {
  }

  // returns if the current item is the one selected or not
  isActiveItem(item) {
    return (this.navService.getCurrentPanel() == item);
  }

}
