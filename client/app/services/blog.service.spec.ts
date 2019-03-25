import { TestBed } from '@angular/core/testing';

import { BlogService } from './blog.service';

describe('BlogdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BlogService = TestBed.get(BlogService);
    expect(service).toBeTruthy();
  });
});
