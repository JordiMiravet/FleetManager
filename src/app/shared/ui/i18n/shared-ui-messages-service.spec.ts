import { TestBed } from '@angular/core/testing';

import { SharedUiMessagesService } from './shared-ui-messages-service';

describe('SharedUiMessagesService', () => {
  let service: SharedUiMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedUiMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
