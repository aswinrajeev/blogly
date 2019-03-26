import { Component, OnInit } from '@angular/core';
import { Blog } from 'client/app/models/blog';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

	blogData: Blog;

  constructor(private blogService: BlogService) { }

  ngOnInit() {
	this.blogData = this.blogService.getBlogData();
  }

  getBlogData():Blog {
	  return this.blogData;
  }

  contentChanged(event) {
	this.blogService.setBlogData(this.blogData);
  }

}
