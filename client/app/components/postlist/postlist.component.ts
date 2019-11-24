import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { BlogPost } from 'client/app/models/blogpost';

@Component({
  selector: 'app-postlist',
  templateUrl: './postlist.component.html',
  styleUrls: ['./postlist.component.scss']
})
export class PostlistComponent implements OnInit {

  constructor(private postService:BlogService, private cdr : ChangeDetectorRef) { 

    this.postService.setNewPostAction(() => {
      this.newPost();
    });

  }

  ngOnInit() {
    if (this.postService.getPostList() == null || this.postService.getPostList().length == 0) {
      this.postService.fetchPostList(() => {
        if (this.postService.getPostList().length == 0) {
          var post = new BlogPost();
          this.postService.getPostList().unshift(post);
          this.postService.setBlogData(post);
        } else {
          this.viewPost(this.postService.getPostList()[0]);
        }
  
        // force update on the UI
        this.cdr.detectChanges();
      });
    }
  }

  // fetches the list of all posts in the workspace
  getPostList() {
    return this.postService.getPostList();
  }

  // fetches complete data for a selected post
  viewPost(post) {
    this.cdr.detectChanges();
    console.log(post.title);
    this.postService.setPost(post, () => {

    });
  }

  // deletes a post
  deletePost(post:BlogPost) {
    console.log('Deleting ' + post.itemId);
    this.postService.deletePost(post);
  }

  // creates a new post
  newPost() {
    var post = new BlogPost();
    this.postService.getPostList().unshift(post);
    this.postService.setBlogData(this.postService.getPostList()[0]);
  }

}
