import { TestBed } from '@angular/core/testing';

import { StreamExtractionService } from './stream-extraction.service';

describe('StreamExtractionService', () => {
  let service: StreamExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreamExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
