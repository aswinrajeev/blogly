import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { Blog } from 'client/app/models/blog';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  worspaceDir:String;
  blogName:String;
  blogUrl:String;

  constructor(private blogService: PostManagerService, private appManager: AppManagerService, private cdr : ChangeDetectorRef) { }

  ngOnInit() {
    // listens to any changes in settings
    this.appManager.getUIEventEmitter().on('settingsUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // returns a list of blogs connected
  getBlogsList() {
    return this.appManager.getBlogsList();
  }

  // returns the workspace path
  getWorkspaceDir() {
    return this.appManager.getWorkspaceDir();
  }

  // prompts a directory selection dialog and updates the workspace variable
  selectWorkspaceDir() {
    this.appManager.selectWorkspaceDir();
  }

  addNewBlog() {
    this.appManager.addBlog(this.blogName, this.blogUrl);
    this.blogUrl = '';
    this.blogName = '';
  }

  deleteBlog(blog) {
    this.appManager.deleteBlog(blog);
  }


}
