import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { QuillModule } from 'ngx-quill'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidepanelComponent } from './components/sidepanel/sidepanel.component';
import { FootbarComponent } from './components/footbar/footbar.component';
import { BlogareaComponent } from './components/blogarea/blogarea.component';
import { FormsModule } from '@angular/forms';
import { PostlistComponent } from './components/postlist/postlist.component';
import { SettingsComponent } from './components/settings/settings.component';

import { AceEditorModule } from 'ng2-ace-editor';

import { SidepaleholderDirective } from './directives/sidepaleholder.directive';
import { BlogconfigsComponent } from './components/blogconfigs/blogconfigs.component';
import { AsrTagsInputComponent } from './components/asr-tags-input/asr-tags-input.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SidebarComponent,
    SidepanelComponent,
    FootbarComponent,
    BlogareaComponent,
    PostlistComponent,
    SettingsComponent,
    BlogconfigsComponent,
    SidepaleholderDirective,
    AsrTagsInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    AceEditorModule,
    QuillModule.forRoot(),
  ],
  entryComponents: [
    PostlistComponent, 
    SettingsComponent,
    BlogconfigsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
