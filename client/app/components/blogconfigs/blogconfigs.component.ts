import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { BlogPost } from 'client/app/models/blogpost';

@Component({
  selector: 'app-blogconfigs',
  templateUrl: './blogconfigs.component.html',
  styleUrls: ['./blogconfigs.component.scss']
})
export class BlogconfigsComponent implements OnInit {

  constructor(private blogService: PostManagerService, private cdr : ChangeDetectorRef) {}

  ngOnInit() {
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogService.getCurrentPost();
  }

}
