import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';

/**
 * Angular component for the application footer
 */
@Component({
  selector: 'app-footbar',
  templateUrl: './footbar.component.html',
  styleUrls: ['./footbar.component.scss']
})
export class FootbarComponent implements OnInit {

  message:String = "Ready";

  /**
   * Constructor for the footer component
   * @param __eventManager 
   */
  constructor(
      private __eventManager: EventmanagerService, 
      private __appManager: AppManagerService,
      private __cdr : ChangeDetectorRef
    ) { }

  /**
   * Initializes the status update channel and its listeners
   */
  ngOnInit() {
    this.__eventManager.getUIEventEmitter().on('statusUpdated', (loading, message) => {
      this.message = message;
      if (!loading) {
        setTimeout(() => {
          this.message = "Ready";
          this.__cdr.detectChanges();
        }, 2000);
      }
      this.__cdr.detectChanges();
    });

    // registers a listener for status updates
    this.__appManager.listenForStatusUpdates();

  }

}
