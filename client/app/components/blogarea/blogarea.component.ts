import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  /* blog attributes */
  //TODO: Change this to a single object
  
  blogData = "";
  blogTitle = "";

  constructor() { }

  ngOnInit() {
  }

}
