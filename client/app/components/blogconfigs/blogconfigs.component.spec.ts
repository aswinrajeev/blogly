import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogconfigsComponent } from './blogconfigs.component';

describe('BlogconfigsComponent', () => {
  let component: BlogconfigsComponent;
  let fixture: ComponentFixture<BlogconfigsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogconfigsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogconfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
