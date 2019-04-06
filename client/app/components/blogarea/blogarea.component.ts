import { Component, OnInit } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  blogData: BlogPost;

  constructor(private blogService: BlogService) { }

  ngOnInit() {
    this.blogData = this.blogService.getBlogData();
    this.blogService.fetchPostList();
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogData;
  }

  // invoked when the blog data is changed
  contentChanged(event) {
    this.blogService.setBlogData(this.blogData);
  }

}
