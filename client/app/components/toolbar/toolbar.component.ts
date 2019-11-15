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

    this.toggleEditor();
  }

  // pubish a blog
  publishBlog(isDraft) {
    this.blogservice.publishBlog(isDraft);
  }

  // creates a new blog post
  newPost() {
    this.blogservice.newPost();
  }

  // saves a post
  savePost() {
    this.blogservice.saveCurrentPost();
  }

  toggleEditor() {
    this.blogservice.setHTMLEditor(!this.blogservice.isHTMLEditor());
  }

}
