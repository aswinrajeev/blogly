import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostlistComponent } from './postlist.component';

describe('PostlistComponent', () => {
  let component: PostlistComponent;
  let fixture: ComponentFixture<PostlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
