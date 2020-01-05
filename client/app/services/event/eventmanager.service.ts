import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';

/**
 * Handler for the various UI events
 */
@Injectable({
  providedIn: 'root'
})
export class EventmanagerService {

  // events emitters for app life-cycle control
  private __uiUpdated: EventEmitter = new EventEmitter();
  private __menuListener: EventEmitter = new EventEmitter();

  /**
   * Constructor for the event manager
   */
  constructor() { }

  /**
   * Returns the UI event emitter
   */
  getUIEventEmitter():EventEmitter {
    return this.__uiUpdated;
  }
  
  /**
   * Returns the menu event emitter
   */
  getMenuEventEmitter() {
    return this.__menuListener;
  }
}
