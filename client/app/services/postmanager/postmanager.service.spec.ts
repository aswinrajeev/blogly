import { TestBed } from '@angular/core/testing';

import { PostManagerService } from './postmanager.service';

describe('BlogdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PostManagerService = TestBed.get(PostManagerService);
    expect(service).toBeTruthy();
  });
});
