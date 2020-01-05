import { TestBed } from '@angular/core/testing';

import { EventmanagerService } from './eventmanager.service';

describe('EventmanagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EventmanagerService = TestBed.get(EventmanagerService);
    expect(service).toBeTruthy();
  });
});
