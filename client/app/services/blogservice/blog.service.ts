import { Injectable } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { MessagingService } from '../messagingservice/messaging.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blog: BlogPost;
  postsList:[];

  constructor(private _messenger: MessagingService) {}

  // returns the blog data
  getBlogData(): BlogPost {
    
    //return the blog object if exist, else initialize and return
    return this.blog ? this.blog : new BlogPost();
  }

  // set the blog post id
  setPostId(id:String):void {
    this.blog.postId = id;
  }

  // set blog data to the service
  setBlogData(blog:BlogPost) {
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

  // returns the posts list
  getPostList():[] {
    return this.postsList;
  }

  // retrieves the list of posts in the posts directory
  fetchPostList(){
    this._messenger.request('fetchposts', null, (data:any) => {
      this.postsList = data;
      console.log(data);
    });
  }
}
