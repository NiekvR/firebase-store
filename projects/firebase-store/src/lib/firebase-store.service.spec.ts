import { TestBed } from '@angular/core/testing';

import { FirebaseStoreService } from './firebase-store.service';

describe('FirebaseStoreService', () => {
  let service: FirebaseStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
