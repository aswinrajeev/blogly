import { Injectable } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { MessagingService } from '../messagingservice/messaging.service';
import { EventEmitter } from 'events';
import { Blog } from 'client/app/models/blog';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

	// blog object data holder
  blogPost: BlogPost;
  postsList:BlogPost[];
  blogs: Blog[];
  newFun: Function;
  workspaceDir:String;

  htmlEditor: boolean = true;

  // event emitter for tracking post changes
  updateListener: EventEmitter = new EventEmitter();
  menuListener: EventEmitter = new EventEmitter();

  constructor(private _messenger: MessagingService) {}

  listenForMenuInvocation() {
    this._messenger.listen('menuInvoked', (payload) => {
      if (payload.action != null && payload.action != '') {
        this.menuListener.emit(payload.action, payload.args);
      }
    }, null);
  }

  // returns the blog data
  getPostData(): BlogPost {
    
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
    this.updateListener.emit("postUpdated");
  }

  // set the blog post id
  setPostId(id:String):void {
    this.blogPost.postId = id;
  }

  // set blog data to the service
  setPostData(blog:BlogPost) {
    this.blogPost = blog;
  }

  // publish a blog post
  publishBlog(blog:Blog, isDraft) {
    var post = this.getPostData();
    var postObj = {
      fileName: post.file,
      blog: blog.getAsBlog(),
      postData: post.getAsPost()
    };

    // listens for a confirmation from the server
    this._messenger.listen('published', (result, channel, post) => {
      if (result.status == 200) {
        this.getPostData().setPostURL(result.data.postURL);
        this.getPostData().setPostId(result.data.postId);
        this.getPostData().setContent(result.data.content);
        this.blogPost = this.getPostData();
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
      var post: BlogPost;

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

  // retrieves the list of blogs saved
  fetchConfigurations() {
    this._messenger.request('fetchConfs', null, (result) => {
      if (result.status == 200) {
        this.workspaceDir = result.workspace;
        if (this.blogs == null) {
          this.blogs = [];
        }
        result.blogs.forEach(blog => {
          this.blogs.push(new Blog(blog.name, blog.url, blog.postId));
        });
      } else {
        console.error("Unable to fetch the configurations.");
      }
    });
  }

  // gets the blogs
  getBlogs():Blog[] {
    return this.blogs;
  }

  // deletes a post
  deletePost(post:BlogPost) {
    this._messenger.listenOnce('deleted' + post.itemId, (result) => {
      console.log(result);
      if (result.status == 200) {
        this.postsList.splice(this.postsList.indexOf(post), 1);

        if (post.itemId == this.getPostData().itemId && this.postsList.length > 0) {
          this.setPost(this.postsList[0], () => {
            // emit a post updated event
            this.updateListener.emit("postUpdated");
          });
        } else if (this.postsList.length == 0) {
          this.newFun();
        }

        // emit a post updated event
        this.updateListener.emit("postUpdated");
      }
    }, {});

    if (post.file != null && post.file.trim() != '') {
      this._messenger.send('deletePost', {
        itemId: post.itemId
      });
    } else {
      // call the deleted event
      this._messenger.invoke('deleted' + post.itemId, {
        status: 200
      }, {});
    } 
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
          post.tags = result.tags;
          this.blogPost = post;
        }
        
        // emit a post updated event
        this.updateListener.emit("postUpdated");
        callback();
  
      });
    } else {
      this.blogPost = post;

      // emit a post updated event
      this.updateListener.emit("postUpdated");
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

        // emit a post updated event
        this.updateListener.emit("postUpdated");
      }
    });
  }

  // requests for a select dir dialog and returns the selected path to worspace path
  selectWorkspaceDir() {
    this._messenger.request('selectDir', null, (dir) => {
      this.workspaceDir = dir;
      this.updateListener.emit('settingsUpdated');
    })
  }

  deleteBlog(blog:Blog) {
    this._messenger.listenOnce('blogDeleted', (result) => {
      if (result.status == 200) {
        this.blogs.splice(this.blogs.indexOf(blog), 1);
        this.updateListener.emit('settingsUpdated');
      }
    }, blog.getAsBlog());
    
    this._messenger.send('deleteBlog', blog.getAsBlog());
  }

  // sets a function to be invoked when new button is pressed
  setNewPostAction(fun) {
    this.newFun = fun;
  }

  // invokes the new post action
  newPost() {
    this.newFun();
  }

  addBlog(alias: String, url: String) {
    var blog:Blog = new Blog(alias, url, null);
    this._messenger.listen('blogAdded', (result) => {
      if (result.status == 200) {
        var blog:Blog = new Blog(result.blog.name, result.blog.url, result.blog.blogId);
        this.blogs.push(blog);
        this.updateListener.emit('settingsUpdated');
      }
    }, null);
    this._messenger.send('newBlog', blog.getAsBlog());
  }

}
