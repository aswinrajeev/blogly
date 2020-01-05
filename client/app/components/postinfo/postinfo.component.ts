import { Component, OnInit } from '@angular/core';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';

@Component({
  selector: 'app-postinfo',
  templateUrl: './postinfo.component.html',
  styleUrls: ['./postinfo.component.scss']
})
export class PostinfoComponent implements OnInit {

  constructor(private postService:PostManagerService) { }

  ngOnInit() {
  }

  getPostData() {
    return this.postService.getCurrentPost();
  }

}
