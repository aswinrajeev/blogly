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

import { AceEditorModule } from 'ng2-ace-editor';

import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "",
    component: PostlistComponent,
    outlet: "sidepanel"
  }
]

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    SidebarComponent,
    SidepanelComponent,
    FootbarComponent,
    BlogareaComponent,
    PostlistComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    AceEditorModule,
    QuillModule.forRoot(),
    RouterModule.forRoot(
      routes
      //, { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
