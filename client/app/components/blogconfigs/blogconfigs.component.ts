import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { BlogPost } from 'client/app/models/blogpost';

@Component({
  selector: 'app-blogconfigs',
  templateUrl: './blogconfigs.component.html',
  styleUrls: ['./blogconfigs.component.scss']
})
export class BlogconfigsComponent implements OnInit {

  constructor(private blogService: BlogService, private cdr : ChangeDetectorRef) {}

  ngOnInit() {
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogService.getBlogData();
  }

}
