import { Component, OnInit } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private blogservice: BlogService) { }

  ngOnInit() {
  }

  publishBlog() {
    this.blogservice.publishBlog();
  }

}
