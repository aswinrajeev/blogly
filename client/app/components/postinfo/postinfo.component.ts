import { Component, OnInit } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';

@Component({
  selector: 'app-postinfo',
  templateUrl: './postinfo.component.html',
  styleUrls: ['./postinfo.component.scss']
})
export class PostinfoComponent implements OnInit {

  /**
   * Constructor for the post info component
   * @param __postService 
   */
  constructor(
      private __postService:PostManagerService
    ) { }

  ngOnInit() {
  }

  /**
   * Returns the current blog post
   */
  getPostData() {
    return this.__postService.getCurrentPost();
  }

}
