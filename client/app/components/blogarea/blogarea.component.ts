import { Component, OnInit } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  constructor(private blogService: BlogService) { }

  ngOnInit() {
    
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogService.getBlogData();
  }

  // invoked when the blog data is changed
  contentChanged(event) {
   // this.blogService.setBlogData(this.blogData);
  }

}
