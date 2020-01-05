import { TestBed } from '@angular/core/testing';

import { AppManagerService } from './appmanager.service';

describe('NavigationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppManagerService = TestBed.get(AppManagerService);
    expect(service).toBeTruthy();
  });
});
