import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogareaComponent } from './blogarea.component';

describe('BlogareaComponent', () => {
  let component: BlogareaComponent;
  let fixture: ComponentFixture<BlogareaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogareaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
