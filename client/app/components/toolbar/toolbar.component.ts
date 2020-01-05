import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { Blog } from 'client/app/models/blog';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private blogservice: PostManagerService, private navService: AppManagerService, private cdr : ChangeDetectorRef) { }

  ngOnInit() {

    this.toggleEditor();
    this.navService.fetchConfigurations();
    this.navService.listenForMenuInvocation();

    this.navService.getMenuEventEmitter().on('save', (args) => {
      this.savePost();
      this.blogservice.postUpdateListener.emit('postUpdated');
    });

    this.navService.getMenuEventEmitter().on('new', (args) => {
      this.newPost();
      this.blogservice.postUpdateListener.emit('postUpdated');
    });

    this.navService.getMenuEventEmitter().on('htmlEditor', (args) => {
      this.toggleEditor();
      this.blogservice.postUpdateListener.emit("postUpdated");
    });

    // listens for publish to blog menu event
    this.navService.getMenuEventEmitter().on('publishToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, false);
    });

    // listens for draft to blog menu event
    this.navService.getMenuEventEmitter().on('draftToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, true);
    });

    // listens for sidebar collapse/expand
    this.navService.getMenuEventEmitter().on('toggleSidePanel', (args) => {
      this.navService.setPanelHidden(!args.viewSideBar);
      this.cdr.detectChanges();
    })

    // listens for any updates to posts
    this.blogservice.postUpdateListener.on('postUpdated', () => {
      this.cdr.detectChanges();
    })


    this.navService.getUIEventEmitter().on('uiUpdated', (args) => {
      this.cdr.detectChanges();
    })

  }

  getBlogs():Blog[] {
    return this.navService.getBlogsList();
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
    this.navService.setHTMLEditor(!this.navService.isHTMLEditor());
  }

  // returns if the current editor is HTML editor
  isHTMLEditor() {
    return this.navService.isHTMLEditor();
  }

}
