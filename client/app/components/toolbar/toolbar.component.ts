import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { Blog } from 'client/app/models/blog';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for the toolbar
 */
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  /**
   * Constructor for the tool bar component
   * @param __blogservice 
   * @param __navService 
   * @param __eventManager 
   * @param __cdr 
   */
  constructor(
      private __blogservice: PostManagerService, 
      private __navService: AppManagerService, 
      private __eventManager: EventmanagerService,
      private __cdr : ChangeDetectorRef
    ) { }

  /**
   * Initializes the listeners for menu item actions and fetches the configurations
   */
  ngOnInit() {

    this.toggleEditor();
    this.__navService.fetchConfigurations();
    this.__navService.listenForMenuInvocation();

    this.__eventManager.getMenuEventEmitter().on('save', (args) => {
      this.savePost();
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    this.__eventManager.getMenuEventEmitter().on('import', (args) => {
      this.importPost();
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    this.__eventManager.getMenuEventEmitter().on('export', (args) => {
      this.exportPost();
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    this.__eventManager.getMenuEventEmitter().on('new', (args) => {
      this.newPost();
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    this.__eventManager.getMenuEventEmitter().on('htmlEditor', (args) => {
      this.toggleEditor();
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    });

    // listens for publish to blog menu event
    this.__eventManager.getMenuEventEmitter().on('publishToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, false);
    });

    // listens for draft to blog menu event
    this.__eventManager.getMenuEventEmitter().on('draftToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, true);
    });

    // listens for sidebar collapse/expand
    this.__eventManager.getMenuEventEmitter().on('toggleSidePanel', (args) => {
      this.__navService.setPanelHidden(!args.viewSideBar);
      this.__eventManager.getUIEventEmitter().emit('uiUpdated');
    })

    // listens for any UI update events
    this.__eventManager.getUIEventEmitter().on('uiUpdated', (args) => {
      this.__cdr.detectChanges();
    })
  }

  /**
   * Returns the list of blogs for the toolbar menu
   */
  getBlogs():Blog[] {
    return this.__navService.getBlogsList();
  }

  /**
   * Publishes the active blog
   * @param blog 
   * @param isDraft 
   */
  publishBlog(blog, isDraft) {
    this.__blogservice.publishBlog(blog, isDraft);
  }

  /**
   * Creates a new post
   */
  newPost() {
    this.__blogservice.newPost();
  }

  /**
   * Saves the active post
   */
  savePost() {
    this.__blogservice.saveCurrentPost();
  }

  /**
   * Exports the active post
   */
  exportPost() {
    this.__blogservice.exportCurrentPost();
  }

  /**
   * Imports a new post from a file
   */
  importPost() {
    this.__blogservice.importPost();
  }

  /**
   * Switches between HTML editor and RT editor
   */
  toggleEditor() {
    this.__navService.setHTMLEditor(!this.__navService.isHTMLEditor());
  }

  /**
   * Returns if the current editor is HTML editor
   */
  isHTMLEditor() {
    return this.__navService.isHTMLEditor();
  }
}
