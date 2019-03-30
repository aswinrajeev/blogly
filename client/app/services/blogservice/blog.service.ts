import { Injectable } from '@angular/core';
import { Blog } from 'client/app/models/blog';
import { MessagingService } from '../messagingservice/messaging.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blog: Blog;

  constructor(private _messenger: MessagingService) {}

  // returns the blog data
  getBlogData(): Blog {
    
    //return the blog object if exist, else initialize and return
    return this.blog ? this.blog : new Blog();
  }

  // set the blog post id
  setPostId(id:String):void {
    this.blog.postId = id;
  }

  // set blog data to the service
  setBlogData(blog:Blog) {
    this.blog = blog;
  }

  // publish a blog post
  publishBlog(isDraft) {
    if (isDraft) {
      this._messenger.send('publishdraft', this.getBlogData());
    } else {
      this._messenger.send('publishblog', this.getBlogData());
    }

    this._messenger.listenOnce('published', (result) => {
      this.setPostId(result.id);
      alert('Blg has been published');
    }, null);

  }
}
