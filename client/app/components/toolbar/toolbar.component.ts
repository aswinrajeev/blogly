import { Component, OnInit } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { Blog } from 'client/app/models/blog';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private blogservice: BlogService) { }

  ngOnInit() {

    this.toggleEditor();
    this.blogservice.fetchConfigurations();
    this.blogservice.listenForMenuInvocation();

    this.blogservice.menuListener.on('save', (args) => {
      this.savePost();
      this.blogservice.updateListener.emit('postUpdated');
    });

    this.blogservice.menuListener.on('new', (args) => {
      this.newPost();
      this.blogservice.updateListener.emit('postUpdated');
    });

    this.blogservice.menuListener.on('htmlEditor', (args) => {
      this.toggleEditor();
      this.blogservice.updateListener.emit("postUpdated");
    });

  }

  getBlogs():Blog[] {
    return this.blogservice.getBlogs();
  }

  // pubish a blog
  publishBlog(blog, isDraft) {
    this.blogservice.publishBlog(blog, isDraft);
  }

  // creates a new blog post
  newPost() {
    this.blogservice.newPost();
  }

  // saves a post
  savePost() {
    this.blogservice.saveCurrentPost();
  }

  // switches between HTML editor and RT editor
  toggleEditor() {
    this.blogservice.setHTMLEditor(!this.blogservice.isHTMLEditor());
  }

  // returns if the current editor is HTML editor
  isHTMLEditor() {
    return this.blogservice.isHTMLEditor();
  }

}
