import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { Blog } from 'client/app/models/blog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  worspaceDir:String;

  constructor(private blogService: BlogService, private cdr : ChangeDetectorRef) { }

  ngOnInit() {
    // listens to any changes in settings
    this.blogService.updateListener.on('settingsUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // returns a list of blogs connected
  getBlogsList() {
    return this.blogService.getBlogs();
  }

  // returns the workspace path
  getWorkspaceDir() {
    return this.blogService.workspaceDir;
  }

  // prompts a directory selection dialog and updates the workspace variable
  selectWorkspaceDir() {
    this.blogService.selectWorkspaceDir();
  }


}
