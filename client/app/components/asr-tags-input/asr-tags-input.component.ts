import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'asr-tags-input',
  templateUrl: './asr-tags-input.component.html',
  styleUrls: ['./asr-tags-input.component.scss']
})
export class AsrTagsInputComponent {

  tagInMaking:String = "";
  @Input() placeholder;
  @Input() tagsList: String[];
  @Output() tagsListChange = new EventEmitter<String[]>();

  constructor() { }

  ngOnInit() {
    console.log("inputs:" + this.tagsList);
  }

  removeTag(tag: String) {
    this.tagsList.splice(this.tagsList.indexOf(tag), 1);
  }

  addTag(tag:String) {
    this.tagsList.push(tag);
  }

  onKeyDown($event: KeyboardEvent) {
    if ($event.code == 'Comma' || $event.code == 'Enter') {
      this.addTag(this.tagInMaking);
      this.tagInMaking = '';
    } else if ($event.code == 'Backspace' && (this.tagInMaking == null || this.tagInMaking.length == 0)) {
      if (this.tagsList != null && this.tagsList.length > 0) {
        this.tagsList.splice(this.tagsList.length - 1, 1);
      }
    }
  }

}
