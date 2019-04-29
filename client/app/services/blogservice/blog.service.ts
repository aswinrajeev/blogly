import { Injectable } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { MessagingService } from '../messagingservice/messaging.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blogPost: BlogPost;
  postsList:BlogPost[];
  newFun: Function;

  constructor(private _messenger: MessagingService) {}

  // returns the blog data
  getBlogData(): BlogPost {
    
    //return the blog object if exist, else initialize and return
    return this.blogPost ? this.blogPost : new BlogPost();
  }

  // set the blog post id
  setPostId(id:String):void {
    this.blogPost.postId = id;
  }

  // set blog data to the service
  setBlogData(blog:BlogPost) {
    this.blogPost = blog;
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
  getPostList():BlogPost[] {
    return this.postsList;
  }

  // retrieves the list of posts in the posts directory
  fetchPostList(callback){
    this._messenger.request('fetchposts', null, (result:any) => {
      var posts:BlogPost[] = new Array<BlogPost>();
      var post;

      if (result != null) {
        result.forEach(data => {
          post = new BlogPost();
          post.postId = data.postId;
          post.title = data.title;
          post.miniContent = data.miniContent;
          post.file = data.filename;
          post.isSaved = true;

          posts.push(post);
        });
      }

      this.postsList = posts;
      callback(posts);
    });
  }

  // sets the selected post as the active blog and renders it to the editor
  setPost(post:BlogPost, callback) {
    if (post.isSaved) {
      this._messenger.request('fetchFullPost', {filename: post.file}, (result) => {
        var post: BlogPost;
  
        console.log(result);
  
        if (result != null) {
          post = new BlogPost();
          post.content = result.content;
          post.title = result.title;
          post.itemId = result.itemId;
          post.postId = result.postId
          post.file = result.file;
          post.isSaved = true;
          this.blogPost = post;
        }
  
      });
    } else {
      this.blogPost = post;
    }
    callback();
  }

  // sets a function to be invoked when new button is pressed
  setNewPostAction(fun) {
    this.newFun = fun;
  }

  // invokes the new post action
  newPost() {
    this.newFun();
  }

}
