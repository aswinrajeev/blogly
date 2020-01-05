import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { Blog } from 'client/app/models/blog';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for the settings side panel
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  __worspaceDir:String;
  __blogName:String;
  __blogUrl:String;

  constructor(
      private __appManager: AppManagerService, 
      private __eventManager: EventmanagerService,
      private __cdr : ChangeDetectorRef
    ) { }

  /**
   * Initializes the component and UI update listener
   */
  ngOnInit() {
    // listens for any UI updates
    this.__eventManager.getUIEventEmitter().on('uiUpdated', () => {
      this.__cdr.detectChanges();
    })
  }

  /**
   * Returns a list of blogs connected
   */
  getBlogsList() {
    return this.__appManager.getBlogsList();
  }

  /**
   * Returns the workspace path
   */
  getWorkspaceDir() {
    return this.__appManager.getWorkspaceDir();
  }

  /**
   * Prompts a directory selection dialog and updates the workspace variable
   */
  selectWorkspaceDir() {
    this.__appManager.selectWorkspaceDir();
  }

  /**
   * Adds a new blog to the connected blogs
   */
  addNewBlog() {
    this.__appManager.addBlog(this.__blogName, this.__blogUrl);
    this.__blogUrl = '';
    this.__blogName = '';
  }

  /**
   * Deletes a blog from the connected blogs
   * @param blog 
   */
  deleteBlog(blog) {
    this.__appManager.deleteBlog(blog);
  }
}
