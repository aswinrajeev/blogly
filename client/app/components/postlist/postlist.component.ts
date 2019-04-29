import { Component, OnInit } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { BlogPost } from 'client/app/models/blogpost';

@Component({
  selector: 'app-postlist',
  templateUrl: './postlist.component.html',
  styleUrls: ['./postlist.component.scss']
})
export class PostlistComponent implements OnInit {

  postList:BlogPost[];

  constructor(private postService:BlogService) { 

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
      }
    });
  }

  // fetches the list of all posts in the workspace
  getPostList() {
    return this.postList;
  }

  // fetches complete data for a selected post
  viewPost(post) {
    console.log(post.title);
    this.postService.setPost(post, function() {

    });
  }

  // creates a new post
  newPost() {
    var post = new BlogPost();
    this.postList.unshift(post);
    this.postService.setBlogData(post);
  }

}
