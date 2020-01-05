import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { MessagingService } from '../messagingservice/messaging.service';
import { Blog } from 'client/app/models/blog';
import { PostManagerService } from '../postmanager/postmanager.service';

/**
 * Handler for app life-cycle management
 */
@Injectable({
  providedIn: 'root'
})
export class AppManagerService {

  private currentPanel: String;
  private workspaceDir: String;
  private blogs: Blog[];
  private panelHidden: boolean = false;
  private htmlEditor: boolean = false;

  // events emitters for app life-cycle control
  private uiUpdated: EventEmitter = new EventEmitter();
  private menuListener: EventEmitter = new EventEmitter();
  
  constructor(private _messenger: MessagingService, private __postManager: PostManagerService) { }

  /**
   * Returns the UI event emitter
   */
  getUIEventEmitter():EventEmitter {
    return this.uiUpdated;
  }
  
  /**
   * Returns the menu event emitter
   */
  getMenuEventEmitter() {
    return this.menuListener;
  }

  /**
   * Returns the current active panel
   */
  getCurrentPanel():String {
    return this.currentPanel;
  }
  
  /**
   * Sets a panel as active.
   * @param currentPanel 
   */
  setCurrentPanel(currentPanel:String) {
    this.currentPanel = currentPanel;
    this.uiUpdated.emit('panelUpdated', currentPanel);
  }

  /**
   * Returns is the side panel is closed or not
   */
  isPanelHidden() {
    return this.panelHidden;
  }

  /**
   * Sets if the side panel is closed or not.
   * @param close 
   */
  setPanelHidden(close:boolean) {
    this.panelHidden = close;
  }

  /**
   * Returns blog list from configuration
   */
  getBlogsList():Blog[] {
    return this.blogs;
  }

  getWorkspaceDir() {
    return this.workspaceDir;
  }

  /**
   * Listens for menu events (from the back-end)
   */
  listenForMenuInvocation() {
    this._messenger.listen('menuInvoked', (payload) => {
      if (payload.action != null && payload.action != '') {
        this.menuListener.emit(payload.action, payload.args);
      }
    }, null);
  }

  /**
   * Fetches the configurations
   */
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

  /**
   * Adds a new blog to the connected blogs
   * @param alias 
   * @param url 
   */
  addBlog(alias: String, url: String) {
    var blog:Blog = new Blog(alias, url, null);

    this._messenger.listenOnce('blogAdded', (result) => {

      if (result.status == 200) {
        var blog:Blog = new Blog(result.blog.name, result.blog.url, result.blog.blogId);
        this.blogs.push(blog);

        // oublish a notification of settings updated
        this.getUIEventEmitter().emit('settingsUpdated');
      }

    }, null);
    
    // sends a backend call to add a new blog
    this._messenger.send('newBlog', blog.getAsBlog());
  }

  /**
   * Removes a blog from the connected blogs
   * @param blog 
   */
  deleteBlog(blog:Blog) {
    this._messenger.listenOnce('blogDeleted', (result) => {
      if (result.status == 200) {
        this.blogs.splice(this.blogs.indexOf(blog), 1);
        this.getUIEventEmitter().emit('settingsUpdated');
      }
    }, null);
    
    this._messenger.send('deleteBlog', blog.getAsBlog());
  }

  /**
   * Requests for a select dir dialog and returns the selected path to worspace path
   */
  selectWorkspaceDir() {
    this._messenger.request('selectDir', null, (dir) => {
      this.workspaceDir = dir;

      // publish a notification of settings updated
      this.getUIEventEmitter().emit('settingsUpdated');
    })
  }

  /** 
   * Returns if the current editor is HTML editor
   */
  isHTMLEditor() {
    return this.htmlEditor;
  }

  /** 
   * Sets the current editor as HTML if isHTML is true
   */ 
  setHTMLEditor(isHTML:boolean) {
    
    var editor;
    var content;

    // updates the content from the back end
    if (this.__postManager.isPostContentValid()) {

      // passes the appropriate content acc to the current editor
      if (!this.isHTMLEditor()) {
        editor = 'html'
        content = this.__postManager.getCurrentPost().htmlContent;
      } else  {
        editor = 'quill';
        content = this.__postManager.getCurrentPost().content;
      }
      
      // request server for updated contents
      this._messenger.request('switchEditor', {
        editor: editor,
        content: content
      }, (result) => {
        
        if (result.status == 200) {
          this.htmlEditor = isHTML;

          var blogPost = this.__postManager.getCurrentPost();
          blogPost.setContent(result.fullContent);
          blogPost.setHTMLContent(result.htmlContent);

          this.getUIEventEmitter().emit('uiUpdated');
        }
      });
    } else {
      this.htmlEditor = isHTML;
    }
  }

}
