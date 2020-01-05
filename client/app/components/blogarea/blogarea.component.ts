import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BlogPost } from 'client/app/models/blogpost';
import { PostManagerService } from 'client/app/services/postmanager/postmanager.service';
import { BloglyImageBlot } from '../../blots/BloglyImageBlot';
import { DividerBlot } from '../../blots/DividerBlot';
import Quill from 'quill';

import 'brace';
import 'brace/mode/html';
import 'brace/theme/gruvbox';
import { AppManagerService } from 'client/app/services/appmanager/appmanager.service';
import { EventmanagerService } from 'client/app/services/event/eventmanager.service';

/**
 * Angular component for the blog editors
 */
@Component({
  selector: 'app-blogarea',
  templateUrl: './blogarea.component.html',
  styleUrls: ['./blogarea.component.scss']
})
export class BlogareaComponent implements OnInit {

  quillModules;
  quillEditor;

  /**
   * Constructor for the blog area component
   * @param __blogService 
   * @param __appManager 
   * @param __eventManager 
   * @param __cdr 
   */
  constructor(
      private __blogService: PostManagerService, 
      private __appManager: AppManagerService, 
      private __eventManager: EventmanagerService,
      private __cdr : ChangeDetectorRef
    ) { 
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

    // listens for any updates to the ui
    this.__eventManager.getUIEventEmitter().on('uiUpdated', (args) => {
      this.__cdr.detectChanges();
    });
  }

  /**
   * Persists the Quill editor object
   * @param editor 
   */
  quillEditorCreated(editor) {
    this.quillEditor = editor;
  }

  /**
   * Returns the current blog post data
   */
  getBlogData(): BlogPost {
    return this.__blogService.getCurrentPost();
  }

  /**
   * Returns if the current editor is HTML editor
   */
  isHTMLEditor():boolean {
    return this.__appManager.isHTMLEditor();
  }

  /**
   * Marks the post as dirty
   */
  markChanged() {
    this.__blogService.getCurrentPost().markDirty(true);
  }

  /**
   * Invoked when the blog data is changed. Updates the mini content and the dirty status.
   * @param event 
   */
  contentChanged(event) {
    // updates the mini content
    this.__blogService.getCurrentPost().updateMiniContent();
    this.markChanged();
  }

  /**
   * Initialize the view elements
   */
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
  }

}
