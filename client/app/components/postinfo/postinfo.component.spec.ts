import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostinfoComponent } from './postinfo.component';

describe('PostinfoComponent', () => {
  let component: PostinfoComponent;
  let fixture: ComponentFixture<PostinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
