import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { BlogPost } from 'client/app/models/blogpost';

@Component({
  selector: 'app-postlist',
  templateUrl: './postlist.component.html',
  styleUrls: ['./postlist.component.scss']
})
export class PostlistComponent implements OnInit {

  postList:BlogPost[];

  constructor(private postService:BlogService, private cdr : ChangeDetectorRef) { 

    this.postService.setNewPostAction(() => {
      this.newPost();
    });

  }

  ngOnInit() {
    this.postService.fetchPostList((postList) => {
      this.postList = this.postService.getPostList();
      if (this.postList.length == 0) {
        var post = new BlogPost();
        this.postList.unshift(post);
        this.postService.setBlogData(post);
      } else {
        this.viewPost(this.postList[0]);
      }

      // force update on the UI
      this.cdr.detectChanges();
    });
  }

  // fetches the list of all posts in the workspace
  getPostList() {
    return this.postList;
  }

  // fetches complete data for a selected post
  viewPost(post) {
    console.log(post.title);
    this.postService.setPost(post, () => {

    });
  }

  // creates a new post
  newPost() {
    var post = new BlogPost();
    this.postList.unshift(post);
    this.postService.setBlogData(post);
  }

}
