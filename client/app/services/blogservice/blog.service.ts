import { Injectable } from '@angular/core';
import { Blog } from 'client/app/models/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blog: Blog;

  constructor() {}

  getBlogData(): Blog {
    
    //return the blog object if exist, else initialize and return
    return this.blog ? this.blog : new Blog();
  }

  setBlogData(blog:Blog) {
    this.blog = blog;
  }

  publishBlog() {
    console.log(this.getBlogData());
  }
}
