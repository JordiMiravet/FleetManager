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

describe('confirmModal', () => {
    it('should return the confirmation modal title', () => {
      expect(service.confirmModal.title).toBe('Are you sure?');
    });

    it('should return the confirmation modal message', () => {
      expect(service.confirmModal.message).toBe(
        'Do you really want to proceed? This action cannot be undone.',
      );
    });

    it('should return the confirm button text', () => {
      expect(service.confirmModal.confirm).toBe('Confirm');
    });

    it('should return the cancel button text', () => {
      expect(service.confirmModal.cancel).toBe('Cancel');
    });

    it('should return the confirm action aria-label', () => {
      expect(service.confirmModal.confirmActionLabel).toBe('Confirm action');
    });

    it('should return the cancel action aria-label', () => {
      expect(service.confirmModal.cancelActionLabel).toBe('Cancel action');
    });
  });

});
