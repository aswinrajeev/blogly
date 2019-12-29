import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { BlogService } from 'client/app/services/blogservice/blog.service';
import { BloglyImageBlot } from '../../blots/BloglyImageBlot';
import { DividerBlot } from '../../blots/DividerBlot';
import Quill from 'quill';

import 'brace';
import 'brace/mode/html';
import 'brace/theme/gruvbox';

@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  quillModules;
  quillEditor;

  constructor(private blogService: BlogService, private cdr : ChangeDetectorRef) { 
      this.quillModules = {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          ['blockquote', 'code-block'],
          [{ 'header': 2 }, { 'header': [2, 3, 4, 5, 6, false] }],
          [{ 'align': [] }],
          ['clean'], 
          ['link', 'image', 'video'],
          ['hr']
        ]
      }
  }

  /**
   * Initialize the Quill editor component and register the update listeners
   */
  ngOnInit() {

    // initializes custom blots for the Quill editor
    Quill.register(BloglyImageBlot);
    Quill.register(DividerBlot);

    // listens for any updates to posts
    this.blogService.updateListener.on('postUpdated', () => {
      this.cdr.detectChanges();
    })
  }

  /**
   * Persists the Quill editor object
   * @param editor 
   */
  quillEditorCreated(editor) {
    this.quillEditor = editor;
  }

  // returns the blog data
  getBlogData(): BlogPost {
    return this.blogService.getPostData();
  }

  // returns if the current editor is HTML editor
  isHTMLEditor():boolean {
    return this.blogService.isHTMLEditor();
  }

  // mark the post as dirty
  markChanged() {
    this.blogService.getPostData().markDirty(true);
  }

  // invoked when the blog data is changed
  contentChanged(event) {
    // updates the mini content
    this.blogService.getPostData().updateMiniContent();
    this.markChanged();
  }

  // initialize the view elements
  ngAfterViewInit() {

    // adds caption and listener for the hr button
    var moreBtn = document.querySelector('.ql-hr');
    moreBtn.innerHTML = '--';
    moreBtn.addEventListener('click', e => {
      e.preventDefault();

      const range = this.quillEditor.getSelection(true);
      this.quillEditor.insertText(range.index, '\n', Quill.sources.USER);
      this.quillEditor.insertEmbed(range.index + 1, 'divider', true, Quill.sources.USER);
      this.quillEditor.setSelection(range.index + 2, Quill.sources.SILENT);
    });

    setTimeout(() => {
      // switch to RT Editor only after 500 ms, since Ace editor would need to initialize
      this.blogService.setHTMLEditor(false);
    }, 500)
  }

}
