import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { BlogPost } from 'client/app/models/blogpost';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for the post list side panel
 */
@Component({
  selector: 'app-postlist',
  templateUrl: './postlist.component.html',
  styleUrls: ['./postlist.component.scss']
})
export class PostlistComponent implements OnInit {

  /**
   * Constructor for the post list component.
   * @param __postService 
   * @param __appManager 
   * @param __eventManager 
   * @param __cdr 
   */
  constructor(
      private __postService:PostManagerService, 
      private __appManager:AppManagerService, 
      private __eventManager: EventmanagerService,
      private __cdr : ChangeDetectorRef
    ) { 

    this.__postService.setNewPostAction(() => {
      this.newPost();
    });

  }

  /**
   * Initializes the posts list and listeners
   */
  ngOnInit() {
    if (this.__postService.getPostList() == null || this.__postService.getPostList().length == 0) {
      this.__postService.fetchPostList(() => {
        if (this.__postService.getPostList().length == 0) {
          var post = new BlogPost();
          this.__postService.getPostList().unshift(post);
          this.__postService.setPostData(post);
        } else {
          this.viewPost(this.__postService.getPostList()[0]);
        }
  
        // force update on the UI
        this.__cdr.detectChanges();
      });
    }

    // listens for any UI updates
    this.__eventManager.getUIEventEmitter().on('uiUpdated', () => {
      this.__cdr.detectChanges();
    })
  }

  /**
   * Fetches the list of all posts in the workspace
   */
  getPostList() {
    return this.__postService.getPostList();
  }

  /**
   * Fetches complete data for a selected post
   * @param post 
   */
  viewPost(post) {
    this.__cdr.detectChanges();
    this.__postService.setPost(post, () => {
      this.__cdr.detectChanges();
    });
  }

  /**
   * Handles delete action for a post
   * @param post 
   */
  deletePost(post:BlogPost) {
    this.__postService.deletePost(post);
  }

  /**
   * Handles new post action
   */
  newPost() {
    var post = new BlogPost();
    this.__postService.getPostList().unshift(post);
    this.__postService.setPostData(this.__postService.getPostList()[0]);
  }

}
