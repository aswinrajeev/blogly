import { Component, OnInit } from '@angular/core';
import { BlogService } from 'client/app/services/blogservice/blog.service';

@Component({
  selector: 'app-postinfo',
  templateUrl: './postinfo.component.html',
  styleUrls: ['./postinfo.component.scss']
})
export class PostinfoComponent implements OnInit {

  constructor(private postService:BlogService) { }

  ngOnInit() {
  }

  getPostData() {
    return this.postService.getPostData();
  }

}
