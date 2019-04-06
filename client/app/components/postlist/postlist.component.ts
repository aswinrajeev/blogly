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

  constructor(private postService:BlogService) { }

  ngOnInit() {
    this.postService.fetchPostList((postList) => {
      console.log(postList);
      this.postList = this.postService.getPostList();
      console.log(this.postList);
      if (this.postList.length == 0) {
        var post = new BlogPost();
        this.postService.setBlogData(post);
      }
    });
  }

  getPostList() {
    return this.postList;
  }

}
