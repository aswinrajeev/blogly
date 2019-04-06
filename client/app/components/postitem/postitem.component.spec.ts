import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostitemComponent } from './postitem.component';

describe('PostitemComponent', () => {
  let component: PostitemComponent;
  let fixture: ComponentFixture<PostitemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostitemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
