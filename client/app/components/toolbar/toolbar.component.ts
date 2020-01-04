import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { Blog } from 'client/app/models/blog';
import { NavigationService } from 'client/app/services/navigationservice/navigation.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(private blogservice: BlogService, private navService: NavigationService, private cdr : ChangeDetectorRef) { }

  ngOnInit() {

    this.toggleEditor();
    this.blogservice.fetchConfigurations();
    this.blogservice.listenForMenuInvocation();

    this.blogservice.menuListener.on('save', (args) => {
      this.savePost();
      this.blogservice.updateListener.emit('postUpdated');
    });

    this.blogservice.menuListener.on('new', (args) => {
      this.newPost();
      this.blogservice.updateListener.emit('postUpdated');
    });

    this.blogservice.menuListener.on('htmlEditor', (args) => {
      this.toggleEditor();
      this.blogservice.updateListener.emit("postUpdated");
    });

    // listens for publish to blog menu event
    this.blogservice.menuListener.on('publishToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, false);
    });

    // listens for draft to blog menu event
    this.blogservice.menuListener.on('draftToBlog', (args) => {
      var blogObj = args.blog;
      var blog = new Blog(blogObj.name, blogObj.url, blogObj.id);
      this.publishBlog(blog, true);
    });

    // listens for sidebar collapse/expand
    this.blogservice.menuListener.on('toggleSidePanel', (args) => {
      this.navService.setPanelHidden(!args.viewSideBar);
      this.cdr.detectChanges();
    })

    // listens for any updates to posts
    this.blogservice.updateListener.on('postUpdated', () => {
      this.cdr.detectChanges();
    })

  }

  getBlogs():Blog[] {
    return this.blogservice.getBlogs();
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
    this.blogservice.setHTMLEditor(!this.blogservice.isHTMLEditor());
    this.cdr.detectChanges();
  }

  // returns if the current editor is HTML editor
  isHTMLEditor() {
    return this.blogservice.isHTMLEditor();
  }

}
