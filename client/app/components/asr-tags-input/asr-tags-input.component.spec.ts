import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsrTagsInputComponent } from './asr-tags-input.component';

describe('AsrTagsInputComponent', () => {
  let component: AsrTagsInputComponent;
  let fixture: ComponentFixture<AsrTagsInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsrTagsInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsrTagsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
