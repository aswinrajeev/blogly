import { Injectable } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { MessagingService } from '../messagingservice/messaging.service';
import { EventEmitter } from 'events';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blogPost: BlogPost;
  postsList:BlogPost[];
  newFun: Function;

  htmlEditor: boolean = true;

  // event emitter for tracking post changes
  postUpdated: EventEmitter = new EventEmitter();

  constructor(private _messenger: MessagingService) {}

  // returns the blog data
  getBlogData(): BlogPost {
    
    //return the blog object if exist, else initialize and return
    return this.blogPost ? this.blogPost : new BlogPost();
  }

  // returns if the current editor is HTML editor
  isHTMLEditor() {
    return !this.htmlEditor;
  }

  // sets the current editor as HTML if isHTML is true
  setHTMLEditor(isHTML:boolean) {
    this.htmlEditor = !isHTML;

    // emit a post updated event
    this.postUpdated.emit("postUpdated");
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
    var post = this.getBlogData();
    var postObj = {
      fileName: post.file,
      postData: post.getAsPost()
    };

    // listens for a confirmation from the server
    this._messenger.listen('published', (result, channel, post) => {
      if (result.status == 200) {
        this.getBlogData().setPostURL(result.data.postURL);
        this.getBlogData().setPostId(result.data.postId);
        this.getBlogData().setContent(result.data.content);
        this.blogPost = this.getBlogData();
      }
    }, post);

    if (isDraft) {
      this._messenger.send('publishdraft', postObj);
    } else {
      this._messenger.send('publishblog', postObj);
    }
    
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
          post.title = data.title;
          post.itemId = data.itemId;
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

  // deletes a post
  deletePost(post:BlogPost) {
    this._messenger.listenOnce('deleted' + post.itemId, (result) => {
      console.log(result);
      if (result.status == 200) {
        this.postsList.splice(this.postsList.indexOf(post));

        // emit a post updated event
        this.postUpdated.emit("postUpdated");
      }
    }, {});

    this._messenger.send('deletePost', {
      itemId: post.itemId
    });
  }

  // sets the selected post as the active blog and renders it to the editor
  setPost(post:BlogPost, callback) {
    if (post.isSaved) {
      this._messenger.request('fetchFullPost', {filename: post.file}, (result) => {
  
        console.log(result);
  
        if (result != null) {
          post.content = result.content;
          post.title = result.title;
          post.itemId = result.itemId;
          post.postId = result.postId
          post.postURL = result.postURL;
          post.file = result.file;
          post.isSaved = true;
          this.blogPost = post;
        }
        
        // emit a post updated event
        this.postUpdated.emit("postUpdated");
        callback();
  
      });
    } else {
      this.blogPost = post;

      // emit a post updated event
      this.postUpdated.emit("postUpdated");
      callback();
    }
  }

  // saves the blog post
  saveCurrentPost() {
    var post = this.blogPost;
    this._messenger.request('savePost', {
      filename: post.file,
      postData: post.getAsPost()
    }, (result) => {
      if (result != null && result.status == 200) {
        post.file = result.filename;
        this.blogPost.setContent(result.data.content);
        this.blogPost.setItemId(result.data.itemId);
        this.blogPost.setFile(result.data.file);
        post.markDirty(false);
      }
    });
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
