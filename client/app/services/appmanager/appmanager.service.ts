import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { MessagingService } from '../messagingservice/messaging.service';
import { Blog } from 'client/app/models/blog';
import { PostManagerService } from '../postmanager/postmanager.service';
import { EventmanagerService } from '../event/eventmanager.service';

/**
 * Handler for app life-cycle management
 */
@Injectable({
  providedIn: 'root'
})
export class AppManagerService {

  private __currentPanel: String;
  private __workspaceDir: String;
  private __blogs: Blog[];
  private __panelHidden: boolean = false;
  private __htmlEditor: boolean = false;
  
  /**
   * Constructor for App Manager. Initializes the messenger and postmanager services
   * @param __messenger 
   * @param __postManager 
   */
  constructor(
    private __messenger: MessagingService, 
    private __postManager: PostManagerService,
    private __eventManager: EventmanagerService
    ) { }

  /**
   * Returns the current active panel
   */
  getCurrentPanel():String {
    return this.__currentPanel;
  }
  
  /**
   * Sets a panel as active.
   * @param currentPanel 
   */
  setCurrentPanel(currentPanel:String) {
    this.__currentPanel = currentPanel;
    this.__eventManager.getUIEventEmitter().emit('panelUpdated', currentPanel);
    this.__eventManager.getUIEventEmitter().emit('uiUpdated');
  }

  /**
   * Returns is the side panel is closed or not
   */
  isPanelHidden() {
    return this.__panelHidden;
  }

  /**
   * Sets if the side panel is closed or not.
   * @param close 
   */
  setPanelHidden(close:boolean) {
    this.__panelHidden = close;
  }

  /**
   * Returns blog list from configuration
   */
  getBlogsList():Blog[] {
    return this.__blogs;
  }

  getWorkspaceDir() {
    return this.__workspaceDir;
  }

  /**
   * Listens for menu events (from the back-end)
   */
  listenForMenuInvocation() {
    this.__messenger.listen('menuInvoked', (payload) => {
      if (payload.action != null && payload.action != '') {
        this.__eventManager.getMenuEventEmitter().emit(payload.action, payload.args);
      }
    }, null);
  }

  /**
   * Fetches the configurations
   */
  fetchConfigurations() {
    this.__messenger.request('fetchConfs', null, (result) => {
      if (result.status == 200) {
        this.__workspaceDir = result.workspace;
        if (this.__blogs == null) {
          this.__blogs = [];
        }
        result.blogs.forEach(blog => {
          this.__blogs.push(new Blog(blog.name, blog.url, blog.postId));
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

    this.__messenger.listenOnce('blogAdded', (result) => {

      if (result.status == 200) {
        var blog:Blog = new Blog(result.blog.name, result.blog.url, result.blog.blogId);
        this.__blogs.push(blog);

        // oublish a notification of UI updated
        this.__eventManager.getUIEventEmitter().emit('uiUpdated');
      }

    }, null);
    
    // sends a backend call to add a new blog
    this.__messenger.send('newBlog', blog.getAsBlog());
  }

  /**
   * Removes a blog from the connected blogs
   * @param blog 
   */
  deleteBlog(blog:Blog) {
    this.__messenger.listenOnce('blogDeleted', (result) => {
      if (result.status == 200) {
        this.__blogs.splice(this.__blogs.indexOf(blog), 1);

        // publish a UI update notification
        this.__eventManager.getUIEventEmitter().emit('uiUpdated');
      }
    }, null);
    
    this.__messenger.send('deleteBlog', blog.getAsBlog());
  }

  /**
   * Requests for a select dir dialog and returns the selected path to worspace path
   */
  selectWorkspaceDir() {
    this.__messenger.request('selectDir', null, (dir) => {
      this.__workspaceDir = dir;

      // publish a notification of ui updated
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    })
  }

  /** 
   * Returns if the current editor is HTML editor
   */
  isHTMLEditor() {
    return this.__htmlEditor;
  }

  /** 
   * Sets the current editor as HTML if isHTML is true
   */ 
  setHTMLEditor(isHTML:boolean) {
    
    var editor;
    var content;

    // updates the content from the back end
    if (this.__postManager.isPostContentValid(!this.isHTMLEditor())) {

      // passes the appropriate content acc to the current editor
      if (!this.isHTMLEditor()) {
        editor = 'html'
        content = this.__postManager.getCurrentPost().htmlContent;
      } else  {
        editor = 'quill';
        content = this.__postManager.getCurrentPost().content;
      }
      
      // request server for updated contents
      this.__messenger.request('switchEditor', {
        editor: editor,
        content: content
      }, (result) => {
        
        if (result.status == 200) {
          this.__htmlEditor = isHTML;

          var blogPost = this.__postManager.getCurrentPost();
          blogPost.setContent(result.fullContent);
          blogPost.setHTMLContent(result.htmlContent);

          this.__eventManager.getUIEventEmitter().emit('uiUpdated');
        }
      });
    } else {
      this.__htmlEditor = isHTML;
    }
  }

}
