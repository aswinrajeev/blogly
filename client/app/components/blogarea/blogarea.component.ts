import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  constructor(private blogService: BlogService, private cdr : ChangeDetectorRef) { }

  ngOnInit() {
    this.blogService.postUpdated.on('postUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogService.getBlogData();
  }

  // mark the post as dirty
  markChanged() {
    this.blogService.getBlogData().markDirty(true);
  }

  // invoked when the blog data is changed
  contentChanged(event) {
    //update the mini content
    this.blogService.getBlogData().updateMiniContent();
    this.markChanged();
  }

}
